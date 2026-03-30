import { createHash, randomBytes, randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";

import { auth, authEnabled } from "@/auth";
import { db, dbAvailable } from "@/db";
import { ensureAppDatabaseSchema } from "@/db/ensure-schema";
import { buildApiUrl } from "@/lib/binboi";
import {
  accessTokens,
  users,
  type AccessTokenStatus,
  type UserPlan,
} from "@/db/schema";

type Viewer = {
  mode: "account" | "preview";
  user: {
    id: string;
    name: string;
    email: string;
    plan: UserPlan;
  };
};

type StoredToken = {
  id: string;
  name: string;
  prefix: string;
  status: AccessTokenStatus;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  tokenHash: string;
};

export type AccessTokenRecord = {
  id: string;
  name: string;
  prefix: string;
  status: AccessTokenStatus;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type AccessTokenListResponse = {
  auth_mode: Viewer["mode"];
  user: Viewer["user"];
  limits: {
    plan: UserPlan;
    max_tokens: number;
    max_tunnels: number;
    tokens_used: number;
    active_tunnels: number | null;
  };
  tokens: AccessTokenRecord[];
};

export type AccessTokenCreateResponse = {
  auth_mode: Viewer["mode"];
  user: Viewer["user"];
  limits: AccessTokenListResponse["limits"];
  token: string;
  record: AccessTokenRecord;
};

export class AccessTokenRouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const PLAN_LIMITS: Record<UserPlan, { maxTokens: number; maxTunnels: number }> = {
  FREE: { maxTokens: 3, maxTunnels: 1 },
  PRO: { maxTokens: 25, maxTunnels: 25 },
  SCALE: { maxTokens: 100, maxTunnels: 100 },
};

type DatabaseLikeError = {
  code?: string;
  message?: string;
  cause?: unknown;
};

function normalizePlan(plan: string | null | undefined): UserPlan {
  const value = String(plan).toUpperCase();
  if (value === "SCALE") {
    return "SCALE";
  }
  if (value === "PRO") {
    return "PRO";
  }
  return "FREE";
}

function sanitizeTokenName(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return "CLI token";
  return value.slice(0, 64);
}

function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateAccessToken(): { token: string; prefix: string; hash: string } {
  const prefix = `binboi_pat_${randomBytes(4).toString("hex")}`;
  const token = `${prefix}_${randomBytes(18).toString("hex")}`;
  return { token, prefix, hash: hashAccessToken(token) };
}

function safeTokenPrefix(token: string): string {
  const parts = token.trim().split("_");
  if (parts.length >= 3 && parts[0] === "binboi" && parts[1] === "pat") {
    return parts.slice(0, 3).join("_");
  }
  return token.trim().slice(0, 20);
}

function extractDatabaseErrorCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const record = current as DatabaseLikeError;
    if (typeof record.code === "string" && record.code) {
      return record.code;
    }
    current = record.cause;
  }
  return null;
}

function extractDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const message = (error as DatabaseLikeError | null)?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  return "Unexpected database error";
}

function mapAccessTokenError(error: unknown, fallback: string): AccessTokenRouteError {
  const code = extractDatabaseErrorCode(error);
  const message = extractDatabaseErrorMessage(error).toLowerCase();

  switch (code) {
    case "42P01":
      return new AccessTokenRouteError(
        503,
        "The access token tables are not ready yet. Binboi is bootstrapping the schema now; retry the request.",
      );
    case "42703":
      return new AccessTokenRouteError(
        503,
        "The auth database schema is out of date for access tokens. Binboi needs the latest auth columns before tokens can be issued.",
      );
    case "23505":
      return new AccessTokenRouteError(409, "A token with that identifier already exists. Retry the request.");
    case "08001":
    case "08006":
      return new AccessTokenRouteError(503, "The auth database is currently unavailable.");
    default:
      if (message.includes("fetch failed") || message.includes("connection") || message.includes("network")) {
        return new AccessTokenRouteError(503, "The auth database is currently unavailable.");
      }
      return new AccessTokenRouteError(500, fallback);
  }
}

function stripSecret(row: StoredToken): AccessTokenRecord {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  };
}

function buildLimits(
  plan: UserPlan,
  tokens: AccessTokenRecord[],
  mode: Viewer["mode"],
): AccessTokenListResponse["limits"] {
  const limits = mode === "preview" ? { maxTokens: 1, maxTunnels: 3 } : PLAN_LIMITS[plan];
  return {
    plan,
    max_tokens: limits.maxTokens,
    max_tunnels: limits.maxTunnels,
    tokens_used: tokens.filter((token) => token.status === "ACTIVE").length,
    active_tunnels: null,
  };
}

async function resolveViewer(): Promise<Viewer> {
  if (!dbAvailable || !authEnabled || !db) {
    return {
      mode: "preview",
      user: {
        id: "local-preview",
        name: "Local Preview",
        email: "preview@binboi.local",
        plan: "FREE",
      },
    };
  }

  try {
    await ensureAppDatabaseSchema();
  } catch (error) {
    throw mapAccessTokenError(
      error,
      "Binboi could not prepare the auth database schema for access tokens.",
    );
  }

  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new AccessTokenRouteError(401, "Sign in to manage access tokens.");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1)
    .catch((error) => {
      throw mapAccessTokenError(error, "Could not load the signed-in user.");
    });

  if (!user) {
    throw new AccessTokenRouteError(404, "Could not load the signed-in user.");
  }
  if (user.isActive === false) {
    throw new AccessTokenRouteError(403, "This Binboi account is inactive.");
  }

  return {
    mode: "account",
    user: {
      id: user.id,
      name: user.name || "Binboi User",
      email: user.email,
      plan: normalizePlan(user.plan),
    },
  };
}

async function listStoredTokens(viewer: Viewer): Promise<StoredToken[]> {
  if (viewer.mode === "preview") {
    const response = await fetch(buildApiUrl("/api/tokens/current"), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new AccessTokenRouteError(502, "Preview relay auth is unavailable.");
    }

    const body = (await response.json()) as {
      token?: string;
      created_at?: string;
      last_used_at?: string;
    };

    if (!body.token) {
      return [];
    }

    return [
      {
        id: "preview-relay-token",
        name: "Preview relay token",
        prefix: safeTokenPrefix(body.token),
        status: "ACTIVE",
        createdAt: body.created_at ? new Date(body.created_at) : new Date(),
        lastUsedAt: body.last_used_at ? new Date(body.last_used_at) : null,
        revokedAt: null,
        tokenHash: hashAccessToken(body.token),
      },
    ];
  }

  if (!db) {
    return [];
  }

  const rows = await db
    .select({
      id: accessTokens.id,
      name: accessTokens.name,
      prefix: accessTokens.prefix,
      status: accessTokens.status,
      createdAt: accessTokens.createdAt,
      lastUsedAt: accessTokens.lastUsedAt,
      revokedAt: accessTokens.revokedAt,
      tokenHash: accessTokens.tokenHash,
    })
    .from(accessTokens)
    .where(eq(accessTokens.userId, viewer.user.id))
    .orderBy(desc(accessTokens.createdAt))
    .catch((error) => {
      throw mapAccessTokenError(error, "Could not load access tokens.");
    });

  return rows.map((row) => ({
    ...row,
    status: row.status ?? "ACTIVE",
    lastUsedAt: row.lastUsedAt ?? null,
    revokedAt: row.revokedAt ?? null,
    createdAt: row.createdAt ?? new Date(),
    tokenHash: row.tokenHash,
  }));
}

export async function listAccessTokens(): Promise<AccessTokenListResponse> {
  const viewer = await resolveViewer();
  const tokens = (await listStoredTokens(viewer)).map(stripSecret);

  return {
    auth_mode: viewer.mode,
    user: viewer.user,
    limits: buildLimits(viewer.user.plan, tokens, viewer.mode),
    tokens,
  };
}

export async function createAccessToken(name: string): Promise<AccessTokenCreateResponse> {
  const viewer = await resolveViewer();
  const currentTokens = (await listStoredTokens(viewer)).map(stripSecret);
  const currentLimits = buildLimits(viewer.user.plan, currentTokens, viewer.mode);

  if (viewer.mode !== "preview" && currentLimits.tokens_used >= currentLimits.max_tokens) {
    throw new AccessTokenRouteError(
      403,
      `${viewer.user.plan} includes up to ${currentLimits.max_tokens} active access tokens. Revoke one before creating another.`,
    );
  }

  let token = "";
  let record: StoredToken | null = null;

  if (viewer.mode === "preview") {
    const response = await fetch(buildApiUrl("/api/tokens/generate"), {
      method: "POST",
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as { token?: string; error?: string };
    if (!response.ok || !body.token) {
      throw new AccessTokenRouteError(502, body.error || "Preview relay auth is unavailable.");
    }

    token = body.token;
    record = {
      id: "preview-relay-token",
      name: sanitizeTokenName(name),
      prefix: safeTokenPrefix(body.token),
      status: "ACTIVE",
      createdAt: new Date(),
      lastUsedAt: null,
      revokedAt: null,
      tokenHash: hashAccessToken(body.token),
    };

    return {
      auth_mode: viewer.mode,
      user: viewer.user,
      limits: buildLimits(viewer.user.plan, [stripSecret(record)], viewer.mode),
      token,
      record: stripSecret(record),
    };
  } else if (db) {
    const sanitizedName = sanitizeTokenName(name);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const createdAt = new Date();
      const generated = generateAccessToken();
      token = generated.token;
      record = {
        id: randomUUID(),
        name: sanitizedName,
        prefix: generated.prefix,
        status: "ACTIVE",
        createdAt,
        lastUsedAt: null,
        revokedAt: null,
        tokenHash: generated.hash,
      };

      try {
        await db.insert(accessTokens).values({
          id: record.id,
          userId: viewer.user.id,
          name: record.name,
          prefix: record.prefix,
          tokenHash: record.tokenHash,
          status: record.status,
          createdAt: record.createdAt,
          lastUsedAt: null,
          revokedAt: null,
        });
        break;
      } catch (error) {
        const code = extractDatabaseErrorCode(error);
        if (code === "23505" && attempt < 2) {
          continue;
        }
        throw mapAccessTokenError(error, "Could not create access token.");
      }
    }
  }

  if (!record || !token) {
    throw new AccessTokenRouteError(500, "Could not create access token.");
  }

  const tokens = [...currentTokens, stripSecret(record)];
  return {
    auth_mode: viewer.mode,
    user: viewer.user,
    limits: buildLimits(viewer.user.plan, tokens, viewer.mode),
    token,
    record: stripSecret(record),
  };
}

export async function revokeAccessToken(tokenId: string): Promise<AccessTokenListResponse> {
  const viewer = await resolveViewer();

  if (viewer.mode === "preview") {
    if (tokenId != "preview-relay-token") {
      throw new AccessTokenRouteError(404, "Access token not found.");
    }

    const [rotateResponse, revokeResponse] = await Promise.all([
      fetch(buildApiUrl("/api/tokens/generate"), { method: "POST", cache: "no-store" }),
      fetch(buildApiUrl("/api/tokens/revoke"), { method: "POST", cache: "no-store" }),
    ]);

    if (!rotateResponse.ok || !revokeResponse.ok) {
      throw new AccessTokenRouteError(502, "Preview relay auth is unavailable.");
    }
  } else if (db) {
    const rows = await db
      .select({ id: accessTokens.id })
      .from(accessTokens)
      .where(and(eq(accessTokens.id, tokenId), eq(accessTokens.userId, viewer.user.id)))
      .limit(1)
      .catch((error) => {
        throw mapAccessTokenError(error, "Could not load access token.");
      });

    if (rows.length === 0) {
      throw new AccessTokenRouteError(404, "Access token not found.");
    }

    await db
      .update(accessTokens)
      .set({
        status: "REVOKED",
        revokedAt: new Date(),
      })
      .where(and(eq(accessTokens.id, tokenId), eq(accessTokens.userId, viewer.user.id)))
      .catch((error) => {
        throw mapAccessTokenError(error, "Could not revoke access token.");
      });
  }

  return listAccessTokens();
}

import "server-only";

import { cookies } from "next/headers";

import type { BillingPlan } from "@/lib/pricing";

const GO_API = process.env.BINBOI_GO_API_URL ?? "http://localhost:8080";

// ── error class ───────────────────────────────────────────────────────────────

export class AccessTokenRouteError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── types ─────────────────────────────────────────────────────────────────────

export type AccessTokenRecord = {
  id: string;
  name: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type AccessTokenListResponse = {
  auth_mode: "account" | "preview";
  user: {
    id: string;
    name: string;
    email: string;
    plan: BillingPlan;
  };
  limits: {
    plan: BillingPlan;
    max_tokens: number;
    max_tunnels: number;
    tokens_used: number;
    active_tunnels: number | null;
  };
  tokens: AccessTokenRecord[];
};

export type AccessTokenCreateResponse = {
  auth_mode: "account" | "preview";
  user: AccessTokenListResponse["user"];
  limits: AccessTokenListResponse["limits"];
  token: string;
  record: AccessTokenRecord;
};

// ── internal helpers ──────────────────────────────────────────────────────────

async function bearerHeaders(): Promise<HeadersInit> {
  const jar = await cookies();
  const token = jar.get("binboi_token")?.value;
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) (h as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  return h;
}

async function goFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GO_API}${path}`, init);
  } catch {
    throw new AccessTokenRouteError(503, "Token sunucusuna ulaşılamıyor.");
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    throw new AccessTokenRouteError(
      res.status,
      (data as { error?: string }).error ?? "Token işlemi başarısız.",
    );
  }

  return data;
}

// ── exported functions ────────────────────────────────────────────────────────

export async function listAccessTokens(): Promise<AccessTokenListResponse> {
  return goFetch<AccessTokenListResponse>("/api/v1/tokens", {
    headers: await bearerHeaders(),
  });
}

export async function createAccessToken(name: string): Promise<AccessTokenCreateResponse> {
  return goFetch<AccessTokenCreateResponse>("/api/v1/tokens", {
    method: "POST",
    headers: await bearerHeaders(),
    body: JSON.stringify({ name: name.trim() || "CLI token" }),
  });
}

export async function revokeAccessToken(tokenId: string): Promise<AccessTokenListResponse> {
  return goFetch<AccessTokenListResponse>(`/api/v1/tokens/${encodeURIComponent(tokenId)}`, {
    method: "DELETE",
    headers: await bearerHeaders(),
  });
}

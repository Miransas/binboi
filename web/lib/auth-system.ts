import "server-only";

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { and, eq, isNull, lt, or } from "drizzle-orm";

import { db, dbAvailable } from "@/db";
import { ensureAppDatabaseSchema } from "@/db/ensure-schema";
import {
  emailVerificationRequests,
  invites,
  passwordResetRequests,
  users,
} from "@/db/schema";

export const authDatabaseEnabled = dbAvailable;
export const githubAuthEnabled = Boolean(
  authDatabaseEnabled &&
    process.env.AUTH_GITHUB_ID &&
    process.env.AUTH_GITHUB_SECRET,
);
export const previewAuthEnabled = !authDatabaseEnabled;

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type DbUserRecord = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  isActive: boolean | null;
};

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: Date | null;
};

export type AuthLinkDelivery = {
  mode: "preview";
  previewUrl: string;
};

export type InviteLookupResult =
  | {
      valid: true;
      email: string;
      expiresAt: string;
    }
  | {
      valid: false;
      message: string;
    };

export class AuthRouteError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function requireAuthDatabase() {
  if (!authDatabaseEnabled || !db) {
    throw new AuthRouteError(
      503,
      "AUTH_PREVIEW_ONLY",
      "Database-backed auth is not configured for this deployment. Use local preview mode until DATABASE_URL is available.",
    );
  }
}

export async function ensureAuthDatabaseReady() {
  requireAuthDatabase();
  await ensureAppDatabaseSchema();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeName(name: string, email: string) {
  const value = name.trim();
  if (value.length >= 2) {
    return value.slice(0, 80);
  }

  return normalizeEmail(email).split("@")[0].slice(0, 80);
}

function validateEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new AuthRouteError(400, "INVALID_EMAIL", "Enter a valid email address.");
  }
  return normalized;
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new AuthRouteError(
      400,
      "WEAK_PASSWORD",
      "Use at least 8 characters for your password.",
    );
  }

  if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
    throw new AuthRouteError(
      400,
      "WEAK_PASSWORD",
      "Use a password with both letters and numbers.",
    );
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");
  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(stored, derived);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function generateRawToken() {
  return randomBytes(24).toString("hex");
}

function makeExpiry(msFromNow: number) {
  return new Date(Date.now() + msFromNow);
}

async function findUserByEmail(email: string) {
  requireAuthDatabase();

  const [user] = await db!
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user satisfies DbUserRecord | undefined;
}

function mapUser(user: DbUserRecord): AuthSessionUser {
  return {
    id: user.id,
    name: user.name || "Binboi User",
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
  };
}

async function deleteExpiredTokens() {
  if (!authDatabaseEnabled || !db) {
    return;
  }

  const now = new Date();
  await Promise.all([
    db.delete(emailVerificationRequests).where(lt(emailVerificationRequests.expiresAt, now)),
    db.delete(passwordResetRequests).where(lt(passwordResetRequests.expiresAt, now)),
  ]);
}

export async function authenticateCredentials(input: {
  email: string;
  password: string;
  allowUnverified?: boolean;
}) {
  await ensureAuthDatabaseReady();
  await deleteExpiredTokens();

  const email = validateEmail(input.email);
  const password = input.password;
  if (!password) {
    throw new AuthRouteError(400, "MISSING_PASSWORD", "Enter your password.");
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    throw new AuthRouteError(
      401,
      "INVALID_CREDENTIALS",
      "The email or password you entered is incorrect.",
    );
  }

  if (user.isActive === false) {
    throw new AuthRouteError(
      403,
      "ACCOUNT_INACTIVE",
      "This account is inactive. Contact support or use a different account.",
    );
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new AuthRouteError(
      401,
      "INVALID_CREDENTIALS",
      "The email or password you entered is incorrect.",
    );
  }

  if (!input.allowUnverified && !user.emailVerified) {
    throw new AuthRouteError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Verify your email before signing in.",
    );
  }

  return mapUser(user);
}

async function createEmailVerificationRequest(userId: string, email: string) {
  requireAuthDatabase();

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await db!
    .delete(emailVerificationRequests)
    .where(or(eq(emailVerificationRequests.userId, userId), eq(emailVerificationRequests.email, email)));

  await db!.insert(emailVerificationRequests).values({
    id: randomUUID(),
    userId,
    email,
    tokenHash,
    expiresAt: makeExpiry(EMAIL_VERIFICATION_TTL_MS),
  });

  return rawToken;
}

async function createPasswordResetRequest(userId: string, email: string) {
  requireAuthDatabase();

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await db!
    .delete(passwordResetRequests)
    .where(or(eq(passwordResetRequests.userId, userId), eq(passwordResetRequests.email, email)));

  await db!.insert(passwordResetRequests).values({
    id: randomUUID(),
    userId,
    email,
    tokenHash,
    expiresAt: makeExpiry(PASSWORD_RESET_TTL_MS),
  });

  return rawToken;
}

async function lookupInviteByToken(rawToken: string) {
  requireAuthDatabase();
  await deleteExpiredTokens();

  const tokenHash = hashToken(rawToken);
  const [invite] = await db!
    .select({
      id: invites.id,
      email: invites.email,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
    })
    .from(invites)
    .where(eq(invites.tokenHash, tokenHash))
    .limit(1);

  return invite;
}

export async function getInviteLookup(token: string): Promise<InviteLookupResult> {
  if (!token) {
    return { valid: false, message: "Invite token is missing." };
  }

  await ensureAuthDatabaseReady();

  const invite = await lookupInviteByToken(token);
  if (!invite) {
    return { valid: false, message: "This invite link is invalid." };
  }

  if (invite.acceptedAt) {
    return { valid: false, message: "This invite link has already been used." };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, message: "This invite link has expired." };
  }

  return {
    valid: true,
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
  };
}

export async function createInvite(input: {
  email: string;
  invitedByUserId: string;
}) {
  await ensureAuthDatabaseReady();

  const email = validateEmail(input.email);
  const rawToken = generateRawToken();
  const expiresAt = makeExpiry(INVITE_TTL_MS);

  await db!
    .delete(invites)
    .where(and(eq(invites.email, email), isNull(invites.acceptedAt)));

  await db!.insert(invites).values({
    id: randomUUID(),
    email,
    tokenHash: hashToken(rawToken),
    invitedByUserId: input.invitedByUserId,
    expiresAt,
  });

  return {
    email,
    inviteToken: rawToken,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function registerCredentialsUser(input: {
  name: string;
  email: string;
  password: string;
  inviteToken?: string | null;
}) {
  await ensureAuthDatabaseReady();

  const email = validateEmail(input.email);
  validatePassword(input.password);
  const name = sanitizeName(input.name, email);
  const passwordHash = hashPassword(input.password);

  let inviteRecord: Awaited<ReturnType<typeof lookupInviteByToken>> | null = null;
  if (input.inviteToken) {
    inviteRecord = await lookupInviteByToken(input.inviteToken);
    if (!inviteRecord) {
      throw new AuthRouteError(404, "INVITE_INVALID", "This invite link is invalid.");
    }
    if (inviteRecord.acceptedAt) {
      throw new AuthRouteError(409, "INVITE_USED", "This invite link has already been used.");
    }
    if (inviteRecord.expiresAt < new Date()) {
      throw new AuthRouteError(410, "INVITE_EXPIRED", "This invite link has expired.");
    }
    if (normalizeEmail(inviteRecord.email) !== email) {
      throw new AuthRouteError(
        400,
        "INVITE_EMAIL_MISMATCH",
        "This invite belongs to a different email address.",
      );
    }
  }

  const existingUser = await findUserByEmail(email);
  const verifiedAt = inviteRecord ? new Date() : existingUser?.emailVerified ?? null;

  if (existingUser?.isActive === false) {
    throw new AuthRouteError(
      403,
      "ACCOUNT_INACTIVE",
      "This account is inactive. Contact support or use a different account.",
    );
  }

  const userId = existingUser?.id ?? randomUUID();
  if (existingUser) {
    if (existingUser.passwordHash) {
      throw new AuthRouteError(
        409,
        "ACCOUNT_EXISTS",
        "An account with this email already exists. Sign in instead.",
      );
    }

    await db!
      .update(users)
      .set({
        name: existingUser.name || name,
        passwordHash,
        emailVerified: verifiedAt,
        isActive: true,
      })
      .where(eq(users.id, existingUser.id));
  } else {
    await db!.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash,
      emailVerified: verifiedAt,
      isActive: true,
    });
  }

  if (inviteRecord) {
    await db!
      .update(invites)
      .set({
        acceptedAt: new Date(),
        acceptedByUserId: userId,
      })
      .where(eq(invites.id, inviteRecord.id));

    return {
      userId,
      email,
      verified: true,
      verificationToken: null,
      inviteAccepted: true,
    };
  }

  const verificationToken = await createEmailVerificationRequest(userId, email);
  return {
    userId,
    email,
    verified: false,
    verificationToken,
    inviteAccepted: false,
  };
}

export async function requestEmailVerification(emailInput: string) {
  await ensureAuthDatabaseReady();
  const email = validateEmail(emailInput);

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthRouteError(404, "USER_NOT_FOUND", "No account was found for that email.");
  }

  if (user.isActive === false) {
    throw new AuthRouteError(
      403,
      "ACCOUNT_INACTIVE",
      "This account is inactive. Contact support or use a different account.",
    );
  }

  if (user.emailVerified) {
    return {
      email,
      alreadyVerified: true,
      verificationToken: null,
    };
  }

  const verificationToken = await createEmailVerificationRequest(user.id, user.email);
  return {
    email,
    alreadyVerified: false,
    verificationToken,
  };
}

export async function verifyEmailToken(rawToken: string) {
  await ensureAuthDatabaseReady();
  await deleteExpiredTokens();

  if (!rawToken) {
    throw new AuthRouteError(400, "TOKEN_REQUIRED", "Verification token is missing.");
  }

  const [request] = await db!
    .select({
      id: emailVerificationRequests.id,
      userId: emailVerificationRequests.userId,
      email: emailVerificationRequests.email,
      expiresAt: emailVerificationRequests.expiresAt,
    })
    .from(emailVerificationRequests)
    .where(eq(emailVerificationRequests.tokenHash, hashToken(rawToken)))
    .limit(1);

  if (!request) {
    throw new AuthRouteError(404, "TOKEN_INVALID", "This verification link is invalid.");
  }

  if (request.expiresAt < new Date()) {
    await db!.delete(emailVerificationRequests).where(eq(emailVerificationRequests.id, request.id));
    throw new AuthRouteError(410, "TOKEN_EXPIRED", "This verification link has expired.");
  }

  await db!
    .update(users)
    .set({
      emailVerified: new Date(),
      isActive: true,
    })
    .where(eq(users.id, request.userId));

  await db!.delete(emailVerificationRequests).where(eq(emailVerificationRequests.id, request.id));

  return {
    email: request.email,
  };
}

export async function requestPasswordReset(emailInput: string) {
  await ensureAuthDatabaseReady();
  const email = validateEmail(emailInput);

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || user.isActive === false) {
    return {
      email,
      resetToken: null,
    };
  }

  const resetToken = await createPasswordResetRequest(user.id, user.email);
  return {
    email,
    resetToken,
  };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}) {
  await ensureAuthDatabaseReady();
  await deleteExpiredTokens();

  if (!input.token) {
    throw new AuthRouteError(400, "TOKEN_REQUIRED", "Reset token is missing.");
  }

  validatePassword(input.password);

  const [request] = await db!
    .select({
      id: passwordResetRequests.id,
      userId: passwordResetRequests.userId,
      email: passwordResetRequests.email,
      expiresAt: passwordResetRequests.expiresAt,
    })
    .from(passwordResetRequests)
    .where(eq(passwordResetRequests.tokenHash, hashToken(input.token)))
    .limit(1);

  if (!request) {
    throw new AuthRouteError(404, "TOKEN_INVALID", "This password reset link is invalid.");
  }

  if (request.expiresAt < new Date()) {
    await db!.delete(passwordResetRequests).where(eq(passwordResetRequests.id, request.id));
    throw new AuthRouteError(410, "TOKEN_EXPIRED", "This password reset link has expired.");
  }

  await db!
    .update(users)
    .set({
      passwordHash: hashPassword(input.password),
      isActive: true,
    })
    .where(eq(users.id, request.userId));

  await db!
    .delete(passwordResetRequests)
    .where(or(eq(passwordResetRequests.id, request.id), eq(passwordResetRequests.userId, request.userId)));

  return {
    email: request.email,
  };
}

export async function markOAuthUserVerified(userId: string) {
  if (!authDatabaseEnabled || !db || !userId) {
    return;
  }

  await ensureAuthDatabaseReady();

  await db!
    .update(users)
    .set({
      emailVerified: new Date(),
      isActive: true,
    })
    .where(and(eq(users.id, userId), isNull(users.emailVerified)));
}

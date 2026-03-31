import "server-only";

import { sql } from "drizzle-orm";

import { db, dbAvailable } from "@/db";

let ensuredSchemaPromise: Promise<void> | null = null;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text,
    "email" text NOT NULL,
    "emailVerified" timestamp,
    "image" text,
    "password_hash" text
  )`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password_hash" text`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'FREE' NOT NULL`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "paddle_customer_id" text`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" ("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "user_paddle_customer_id_unique" ON "user" ("paddle_customer_id")`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "userId" text NOT NULL,
    "type" text NOT NULL,
    "provider" text NOT NULL,
    "providerAccountId" text NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,
    PRIMARY KEY ("provider", "providerAccountId")
  )`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'account_userId_user_id_fk'
    ) THEN
      ALTER TABLE "account"
      ADD CONSTRAINT "account_userId_user_id_fk"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "sessionToken" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL,
    "expires" timestamp NOT NULL
  )`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'session_userId_user_id_fk'
    ) THEN
      ALTER TABLE "session"
      ADD CONSTRAINT "session_userId_user_id_fk"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "verificationToken" (
    "identifier" text NOT NULL,
    "token" text NOT NULL,
    "expires" timestamp NOT NULL,
    PRIMARY KEY ("identifier", "token")
  )`,
  `CREATE TABLE IF NOT EXISTS "email_verification_request" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "email" text NOT NULL,
    "token_hash" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "email_verification_request" ADD COLUMN IF NOT EXISTS "email" text`,
  `ALTER TABLE "email_verification_request" ADD COLUMN IF NOT EXISTS "token_hash" text`,
  `ALTER TABLE "email_verification_request" ADD COLUMN IF NOT EXISTS "expires_at" timestamp`,
  `ALTER TABLE "email_verification_request" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_request_token_hash_unique" ON "email_verification_request" ("token_hash")`,
  `CREATE INDEX IF NOT EXISTS "email_verification_request_user_id_idx" ON "email_verification_request" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "email_verification_request_email_idx" ON "email_verification_request" ("email")`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'email_verification_request_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "email_verification_request"
      ADD CONSTRAINT "email_verification_request_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "password_reset_request" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "email" text NOT NULL,
    "token_hash" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "password_reset_request" ADD COLUMN IF NOT EXISTS "email" text`,
  `ALTER TABLE "password_reset_request" ADD COLUMN IF NOT EXISTS "token_hash" text`,
  `ALTER TABLE "password_reset_request" ADD COLUMN IF NOT EXISTS "expires_at" timestamp`,
  `ALTER TABLE "password_reset_request" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_request_token_hash_unique" ON "password_reset_request" ("token_hash")`,
  `CREATE INDEX IF NOT EXISTS "password_reset_request_user_id_idx" ON "password_reset_request" ("user_id")`,
  `CREATE INDEX IF NOT EXISTS "password_reset_request_email_idx" ON "password_reset_request" ("email")`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_request_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "password_reset_request"
      ADD CONSTRAINT "password_reset_request_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "invite" (
    "id" text PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "token_hash" text NOT NULL,
    "invited_by_user_id" text,
    "accepted_by_user_id" text,
    "expires_at" timestamp NOT NULL,
    "accepted_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "email" text`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "token_hash" text`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "invited_by_user_id" text`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "accepted_by_user_id" text`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "expires_at" timestamp`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "accepted_at" timestamp`,
  `ALTER TABLE "invite" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "invite_token_hash_unique" ON "invite" ("token_hash")`,
  `CREATE INDEX IF NOT EXISTS "invite_email_idx" ON "invite" ("email")`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'invite_invited_by_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "invite"
      ADD CONSTRAINT "invite_invited_by_user_id_user_id_fk"
      FOREIGN KEY ("invited_by_user_id") REFERENCES "user"("id") ON DELETE set null;
    END IF;
  END $$;`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'invite_accepted_by_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "invite"
      ADD CONSTRAINT "invite_accepted_by_user_id_user_id_fk"
      FOREIGN KEY ("accepted_by_user_id") REFERENCES "user"("id") ON DELETE set null;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "access_token" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "name" text NOT NULL,
    "prefix" text NOT NULL,
    "token_hash" text NOT NULL,
    "status" text DEFAULT 'ACTIVE' NOT NULL,
    "last_used_at" timestamp,
    "revoked_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "name" text`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "prefix" text`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "token_hash" text`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'ACTIVE' NOT NULL`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "revoked_at" timestamp`,
  `ALTER TABLE "access_token" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "access_token_prefix_unique" ON "access_token" ("prefix")`,
  `CREATE INDEX IF NOT EXISTS "access_token_user_id_idx" ON "access_token" ("user_id")`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'access_token_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "access_token"
      ADD CONSTRAINT "access_token_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
  `CREATE TABLE IF NOT EXISTS "billing_subscriptions" (
    "id" serial PRIMARY KEY,
    "user_id" text NOT NULL,
    "provider" text DEFAULT 'PADDLE' NOT NULL,
    "plan" text DEFAULT 'FREE' NOT NULL,
    "status" text DEFAULT 'FREE' NOT NULL,
    "paddle_subscription_id" text,
    "paddle_customer_id" text,
    "paddle_price_id" text,
    "renews_at" timestamp,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "provider" text DEFAULT 'PADDLE' NOT NULL`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'FREE' NOT NULL`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'FREE' NOT NULL`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "paddle_subscription_id" text`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "paddle_customer_id" text`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "paddle_price_id" text`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "renews_at" timestamp`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "cancel_at_period_end" boolean DEFAULT false NOT NULL`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
  `ALTER TABLE "billing_subscriptions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "billing_subscriptions_paddle_subscription_id_unique" ON "billing_subscriptions" ("paddle_subscription_id")`,
  `CREATE INDEX IF NOT EXISTS "billing_subscriptions_user_id_idx" ON "billing_subscriptions" ("user_id")`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'billing_subscriptions_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "billing_subscriptions"
      ADD CONSTRAINT "billing_subscriptions_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
    END IF;
  END $$;`,
];

export async function ensureAppDatabaseSchema() {
  if (!dbAvailable || !db) {
    return;
  }

  if (!ensuredSchemaPromise) {
    ensuredSchemaPromise = (async () => {
      for (const statement of schemaStatements) {
        await db.execute(sql.raw(statement));
      }
    })().catch((error) => {
      ensuredSchemaPromise = null;
      throw error;
    });
  }

  return ensuredSchemaPromise;
}

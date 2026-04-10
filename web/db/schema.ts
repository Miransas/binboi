import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export type UserPlan = "FREE" | "PRO" | "SCALE";
export type AccessTokenStatus = "ACTIVE" | "REVOKED";
export type SubscriptionStatus =
  | "FREE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "PAUSED"
  | "CANCELED";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  plan: text("plan").$type<UserPlan>().notNull().default("FREE"),
  isActive: boolean("is_active").default(true),
  paddleCustomerId: text("paddle_customer_id").unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const emailVerificationRequests = pgTable("email_verification_request", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("email_verification_request_user_id_idx").on(table.userId),
  emailIdx: index("email_verification_request_email_idx").on(table.email),
}));

export const passwordResetRequests = pgTable("password_reset_request", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("password_reset_request_user_id_idx").on(table.userId),
  emailIdx: index("password_reset_request_email_idx").on(table.email),
}));

export const invites = pgTable("invite", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedByUserId: text("invited_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  acceptedByUserId: text("accepted_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("invite_email_idx").on(table.email),
}));

export const accessTokens = pgTable("access_token", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prefix: text("prefix").notNull().unique(),
  tokenHash: text("token_hash").notNull(),
  status: text("status").$type<AccessTokenStatus>().notNull().default("ACTIVE"),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("access_token_user_id_idx").on(table.userId),
}));

export const tunnels = pgTable("tunnels", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  subdomain: text("subdomain").unique().notNull(),
  targetPort: integer("target_port").notNull(),
  isOnline: boolean("is_online").default(false),
  lastActiveAt: timestamp("last_active_at", { mode: "date" }),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  subdomain: text("subdomain").notNull(),
  ipAddress: text("ip_address"),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const billingSubscriptions = pgTable("billing_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("PADDLE"),
  plan: text("plan").$type<UserPlan>().notNull().default("FREE"),
  status: text("status").$type<SubscriptionStatus>().notNull().default("FREE"),
  paddleSubscriptionId: text("paddle_subscription_id").unique(),
  paddleCustomerId: text("paddle_customer_id"),
  paddlePriceId: text("paddle_price_id"),
  renewsAt: timestamp("renews_at", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("billing_subscriptions_user_id_idx").on(table.userId),
}));

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export const dbAvailable = Boolean(databaseUrl);

// Migration client — disables prefetch (required for drizzle-kit push/migrate)
export const migrationClient = databaseUrl
  ? postgres(databaseUrl, { max: 1 })
  : null;

// Query client — pooled for app use
const queryClient = databaseUrl
  ? postgres(databaseUrl, { max: 10, idle_timeout: 30 })
  : null;

export const db = queryClient
  ? drizzle(queryClient, { schema })
  : null;

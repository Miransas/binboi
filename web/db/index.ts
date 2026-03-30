import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

export const dbAvailable = Boolean(databaseUrl);

export const db = dbAvailable
  ? drizzle(neon(databaseUrl as string), { schema })
  : null;

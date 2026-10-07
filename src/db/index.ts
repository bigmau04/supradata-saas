import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// connection string can be defined in .env as DATABASE_URL
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL is not set in environment variables");
}

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

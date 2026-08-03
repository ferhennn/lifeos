import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Supabase connection string.");
}

// Next.js dev-mode hot-reload re-evaluates this module on every file edit. Without caching
// the client on globalThis, each reload opens a fresh pool without closing the old one,
// eventually exhausting the Supabase pooler's connection limit.
const globalForDb = globalThis as unknown as { postgresClient?: postgres.Sql };

// Supabase pooled connections (port 6543, "Transaction" mode) don't support
// prepared statements — disabled here so this client works against either
// the pooled or direct connection string.
const client = globalForDb.postgresClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle({ client, schema });

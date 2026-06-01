import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL as string;

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// For a managed/remote Postgres that requires TLS, append `?sslmode=require` to
// POSTGRES_URL (postgres-js reads SSL options from the connection string).
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

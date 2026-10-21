import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();
const useSsl = process.env.DATABASE_SSL === "true";

export const db = connectionString
  ? new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: true } : false,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    })
  : null;

export async function checkDatabase(): Promise<boolean> {
  if (!db) {
    return false;
  }

  const result = await db.query("SELECT 1 AS connected");
  return result.rows[0]?.connected === 1;
}

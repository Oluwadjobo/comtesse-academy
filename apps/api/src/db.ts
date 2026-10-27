
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();
const useSsl = process.env.DATABASE_SSL === "true";

if (connectionString && useSsl && /[?&]sslmode=require(?:&|$)/i.test(connectionString)) {
  console.warn(
    "Configuration SSL : sslmode=require est présent dans DATABASE_URL. " +
      "Pour conserver la validation complète du certificat, préférez sslmode=verify-full."
  );
}

export const db = connectionString
  ? new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: true } : false,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      keepAlive: true,
    })
  : null;

db?.on("error", (error) => {
  console.error("Erreur inattendue du pool PostgreSQL :", {
    message: error.message,
    code: (error as NodeJS.ErrnoException).code,
  });
});

export async function checkDatabase(): Promise<boolean> {
  if (!db) {
    return false;
  }

  const result = await db.query("SELECT 1 AS connected");
  return result.rows[0]?.connected === 1;
}

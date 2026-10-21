import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../src/db.js";

const migrationName = "001_initial_schema.sql";

if (!db) {
  console.error("DATABASE_URL absente. Vérifie le fichier .env local.");
  process.exitCode = 1;
} else {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const existing = await client.query(
      "SELECT name FROM schema_migrations WHERE name = $1",
      [migrationName],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      console.log("Migration déjà appliquée :", migrationName);
      await client.query("COMMIT");
    } else {
      const currentFile = fileURLToPath(import.meta.url);
      const currentDirectory = path.dirname(currentFile);
      const sqlPath = path.resolve(
        currentDirectory,
        "../migrations",
        migrationName,
      );
      const sql = await readFile(sqlPath, "utf8");

      await client.query(sql);

      await client.query(
        "INSERT INTO schema_migrations (name) VALUES ($1)",
        [migrationName],
      );

      await client.query("COMMIT");
      console.log("Migration appliquée avec succès :", migrationName);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Échec de la migration. Les changements ont été annulés.");
    console.error(error instanceof Error ? error.message : "Erreur inconnue");
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

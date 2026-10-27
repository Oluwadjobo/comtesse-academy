
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const migrationsDirectory = path.resolve(
  currentDirectory,
  "../migrations",
);

if (!db) {
  console.error("DATABASE_URL absente. Vérifie le fichier .env local.");
  process.exitCode = 1;
} else {
  const client = await db.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => /^\d{3}_[a-z0-9_-]+\.sql$/i.test(name))
      .sort();

    for (const migrationName of files) {
      await client.query("BEGIN");

      try {
        const existing = await client.query(
          "SELECT name FROM schema_migrations WHERE name = $1",
          [migrationName],
        );

        if (existing.rowCount && existing.rowCount > 0) {
          await client.query("COMMIT");
          console.log("Migration déjà appliquée :", migrationName);
          continue;
        }

        const sqlPath = path.join(migrationsDirectory, migrationName);
        const sql = await readFile(sqlPath, "utf8");

        await client.query(sql);

        await client.query(
          "INSERT INTO schema_migrations (name) VALUES ($1)",
          [migrationName],
        );

        await client.query("COMMIT");
        console.log("Migration appliquée avec succès :", migrationName);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `Échec de la migration ${migrationName} : ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`,
        );
      }
    }

    if (files.length === 0) {
      console.log("Aucun fichier de migration SQL trouvé.");
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Erreur inconnue",
    );
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

#!/usr/bin/env node
/**
 * Migration runner script
 * This script applies SQL migrations to the database
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl || !authToken) {
    console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    process.exit(1);
  }

  const db = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  const migrationsDir = path.join(__dirname, "../drizzle/migrations");
  const migrationFile = "0009_add_habit_streak.sql";
  const migrationPath = path.join(migrationsDir, migrationFile);

  console.log(`\n🚀 Running migration: ${migrationFile}\n`);

  try {
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      await db.execute(statement);
    }

    console.log("\n✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();

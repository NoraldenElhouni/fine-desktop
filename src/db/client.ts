// src/main/db/client.ts
import { app } from "electron";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = path.join(app.getPath("userData"), "erp-local.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL"); // safer for concurrent read/write

export const db = drizzle(sqlite, { schema });

// In dev, migrations sit next to the bundled main.js (copied there by
// vite-plugin-static-copy, see vite.main.config.ts). In a packaged build
// __dirname resolves inside app.asar, so forge.config.ts's `extraResource`
// copies the same folder to Contents/Resources instead, outside the asar.
const migrationsFolder = app.isPackaged
  ? path.join(process.resourcesPath, "migrations")
  : path.join(__dirname, "migrations");

migrate(db, { migrationsFolder });

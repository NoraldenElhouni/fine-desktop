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

// TODO: __dirname here resolves inside the asar archive once packaged
// (`npm run make`), and better-sqlite3/drizzle can't read migration files
// from inside an asar. This will need an app.isPackaged branch pointing at
// an unpacked resource path (e.g. via asarUnpack + process.resourcesPath)
// before shipping a packaged build.
migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

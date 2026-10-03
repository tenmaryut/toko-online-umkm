import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Membuka koneksi SQLite + Drizzle. Dipakai aplikasi (lewat src/db/index.ts) maupun skrip
 * migrasi/seed/reset. Modul ini sengaja tidak memakai "server-only" agar bisa dijalankan skrip Node.
 */
export function bukaDatabase(lokasi: string) {
  if (lokasi !== ":memory:") fs.mkdirSync(/*turbopackIgnore: true*/ path.dirname(lokasi), { recursive: true });
  const sqlite = new Database(lokasi);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  return { sqlite, db: drizzle({ client: sqlite, schema }) };
}

export type DB = ReturnType<typeof bukaDatabase>["db"];

export function lokasiDatabase(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "toko.db");
}

export function folderUnggahan(): string {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
}

import "server-only";
import { bukaDatabase, type DB, lokasiDatabase } from "./client";

const globalUntukDb = globalThis as unknown as { __tokoDb?: DB };

/**
 * Koneksi dibuka saat pertama kali dipakai (bukan saat modul diimpor), supaya `next build`
 * tidak membuat file database. Disimpan di globalThis agar tidak berlipat saat hot reload.
 */
export function getDb(): DB {
  if (!globalUntukDb.__tokoDb) {
    globalUntukDb.__tokoDb = bukaDatabase(lokasiDatabase()).db;
  }
  return globalUntukDb.__tokoDb;
}

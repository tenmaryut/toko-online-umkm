/**
 * Menyiapkan database: migrasi skema, isi data demo kalau masih kosong, dan pastikan
 * akun admin asli ada. Dijalankan sebagai ExecStartPre layanan systemd dan `npm run db:setup`.
 *
 * Kredensial admin asli dibaca dari:
 *   - $CREDENTIALS_DIRECTORY/admin (systemd LoadCredential=admin:/root/tenma-ws/portofolio/rahasia/...), atau
 *   - ADMIN_CREDENTIALS_FILE (untuk pengembangan lokal).
 */
import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { bacaKredensialAdmin, pastikanAdminAsli } from "../src/db/admin";
import { bukaDatabase, lokasiDatabase } from "../src/db/client";
import { databaseKosong, hapusSesiKedaluwarsa, isiUlangDataDemo } from "../src/db/seed";

async function main() {
  const lokasi = lokasiDatabase();
  const { db, sqlite } = bukaDatabase(lokasi);
  const folderMigrasi = process.env.MIGRATIONS_DIR ?? path.join(process.cwd(), "drizzle");

  migrate(db, { migrationsFolder: folderMigrasi });
  console.log(`[db-setup] migrasi selesai (${lokasi})`);

  if (databaseKosong(db)) {
    const hasil = await isiUlangDataDemo(db);
    console.log(`[db-setup] data demo diisi: ${hasil.kategori} kategori, ${hasil.produk} produk`);
  }

  const fileKredensial = process.env.CREDENTIALS_DIRECTORY
    ? path.join(process.env.CREDENTIALS_DIRECTORY, "admin")
    : process.env.ADMIN_CREDENTIALS_FILE;
  if (fileKredensial && fs.existsSync(fileKredensial)) {
    const kred = bacaKredensialAdmin(fs.readFileSync(fileKredensial, "utf8"));
    if (kred) {
      const status = await pastikanAdminAsli(db, kred);
      console.log(`[db-setup] admin asli: ${status}`);
    } else {
      console.warn("[db-setup] file kredensial admin tidak valid (butuh Email dan Password ≥ 12 karakter)");
    }
  } else {
    console.log("[db-setup] tidak ada file kredensial admin asli; dilewati");
  }

  hapusSesiKedaluwarsa(db);
  sqlite.close();
}

main().catch((err) => {
  console.error("[db-setup] gagal:", err);
  process.exit(1);
});

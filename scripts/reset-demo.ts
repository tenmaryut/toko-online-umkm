/**
 * Reset malam data demo: kosongkan pesanan, produk, akun pengunjung, dan file unggahan,
 * lalu isi ulang data demo. Admin asli dipertahankan.
 * Dijalankan oleh web-toko-online-umkm-reset.timer (tiap pukul 00.00 WIB) dan `npm run db:reset`.
 */
import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { bukaDatabase, folderUnggahan, lokasiDatabase } from "../src/db/client";
import { isiUlangDataDemo } from "../src/db/seed";

async function main() {
  const { db, sqlite } = bukaDatabase(lokasiDatabase());
  migrate(db, { migrationsFolder: process.env.MIGRATIONS_DIR ?? path.join(process.cwd(), "drizzle") });

  const hasil = await isiUlangDataDemo(db);

  const folder = folderUnggahan();
  let terhapus = 0;
  if (fs.existsSync(folder)) {
    for (const nama of fs.readdirSync(folder)) {
      fs.rmSync(path.join(folder, nama), { force: true, recursive: true });
      terhapus++;
    }
  }

  try {
    sqlite.pragma("wal_checkpoint(TRUNCATE)");
    sqlite.exec("VACUUM");
  } catch (err) {
    console.warn("[reset-demo] checkpoint/VACUUM dilewati:", err);
  }
  sqlite.close();
  console.log(
    `[reset-demo] selesai ${new Date().toISOString()}: ${hasil.kategori} kategori, ${hasil.produk} produk, ` +
      `${hasil.pelanggan} pelanggan demo, ${terhapus} file unggahan dihapus`,
  );
}

main().catch((err) => {
  console.error("[reset-demo] gagal:", err);
  process.exit(1);
});

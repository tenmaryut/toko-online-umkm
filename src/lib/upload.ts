import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { folderUnggahan } from "@/db/client";

export const MAKS_UKURAN_GAMBAR = 2 * 1024 * 1024; // 2 MB
export const TIPE_GAMBAR = ["image/jpeg", "image/png", "image/webp"] as const;
const FORMAT_SHARP = new Set(["jpeg", "png", "webp"]);
export const POLA_FILE_UNGGAHAN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

export type HasilUnggah = { ok: true; path: string } | { ok: false; pesan: string };

/**
 * Memvalidasi dan menyimpan gambar produk:
 * 1. tipe MIME dan ukuran dibatasi (JPG/PNG/WebP, maks. 2 MB),
 * 2. isi file diperiksa sharp (bukan hanya ekstensi/MIME dari klien), dimensi dibatasi,
 * 3. dikonversi ulang ke WebP persegi maks. 1000 px; metadata (EXIF/GPS) ikut terbuang,
 * 4. disimpan dengan nama acak di UPLOAD_DIR, di luar folder build.
 */
export async function simpanGambarProduk(file: File): Promise<HasilUnggah> {
  if (file.size > MAKS_UKURAN_GAMBAR) return { ok: false, pesan: "Ukuran gambar maksimal 2 MB." };
  if (!(TIPE_GAMBAR as readonly string[]).includes(file.type)) {
    return { ok: false, pesan: "Format gambar harus JPG, PNG, atau WebP." };
  }
  const masukan = Buffer.from(await file.arrayBuffer());
  try {
    const meta = await sharp(masukan, { limitInputPixels: 40_000_000 }).metadata();
    if (!meta.format || !FORMAT_SHARP.has(meta.format)) return { ok: false, pesan: "Isi file bukan gambar JPG, PNG, atau WebP." };
    if ((meta.width ?? 0) < 200 || (meta.height ?? 0) < 200) return { ok: false, pesan: "Gambar minimal 200 × 200 piksel." };
    // Sisi persegi = sisi terpendek (maks. 1000 px); orientasi EXIF diterapkan dulu oleh rotate().
    const sisi = Math.min(meta.width ?? 1000, meta.height ?? 1000, 1000);
    const keluaran = await sharp(masukan, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: sisi, height: sisi, fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toBuffer();
    const nama = `${randomUUID()}.webp`;
    const folder = folderUnggahan();
    await fs.mkdir(/*turbopackIgnore: true*/ folder, { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ path.join(folder, nama), keluaran, { mode: 0o640 });
    return { ok: true, path: `/uploads/${nama}` };
  } catch {
    return { ok: false, pesan: "Gambar tidak bisa dibaca. Coba file lain." };
  }
}

/** Menghapus file unggahan lama (gambar bawaan di /images tidak disentuh). */
export async function hapusGambarUnggahan(imagePath: string): Promise<void> {
  if (!imagePath.startsWith("/uploads/")) return;
  const nama = path.basename(imagePath);
  if (!POLA_FILE_UNGGAHAN.test(nama)) return;
  await fs.rm(/*turbopackIgnore: true*/ path.join(folderUnggahan(), nama), { force: true });
}

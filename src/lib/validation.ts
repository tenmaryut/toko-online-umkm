import { z } from "zod";
import { MAKS_JUMLAH_PER_PRODUK } from "./cart";
import { parseRupiah } from "./format";
import { normalkanHp, POLA_HP, POLA_KODE_POS } from "./pola";
import { METODE_PEMBAYARAN, STATUS_PESANAN } from "./order-status";
import { LAYANAN_IDS, NAMA_PROVINSI } from "./shipping";
import { POLA_SLUG } from "./slug";

// Pesan bawaan Zod dalam Bahasa Indonesia; pesan penting tetap ditulis sendiri.
z.config(z.locales.id());

const teks = (min: number, maks: number, label: string) =>
  z
    .string({ error: `${label} wajib diisi` })
    .trim()
    .min(min, { error: `${label} minimal ${min} karakter` })
    .max(maks, { error: `${label} maksimal ${maks} karakter` });

const kotakCentang = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** Kosong ("") dianggap tidak diisi. */
const opsional = <T extends z.ZodType>(skema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), skema.optional());

export const skemaEmail = z
  .string({ error: "Email wajib diisi" })
  .trim()
  .toLowerCase()
  .max(120, { error: "Email terlalu panjang" })
  .pipe(z.email({ error: "Format email tidak valid" }));

export const skemaPassword = z
  .string({ error: "Kata sandi wajib diisi" })
  .min(8, { error: "Kata sandi minimal 8 karakter" })
  .max(128, { error: "Kata sandi maksimal 128 karakter" });

// ---------- Autentikasi ----------

export const skemaMasuk = z.object({
  email: skemaEmail,
  password: z
    .string({ error: "Kata sandi wajib diisi" })
    .min(1, { error: "Kata sandi wajib diisi" })
    .max(128, { error: "Kata sandi terlalu panjang" }),
  kembali: z.string().max(200).optional(),
});

export const skemaDaftar = z
  .object({
    name: teks(2, 80, "Nama"),
    email: skemaEmail,
    password: skemaPassword,
    confirmPassword: z.string({ error: "Ulangi kata sandi" }),
    consent: z.literal("on", { error: "Centang pernyataan bahwa Anda memahami ini situs demo" }),
    kembali: z.string().max(200).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "Kata sandi dan ulangan kata sandi tidak sama",
    path: ["confirmPassword"],
  });

const AWALAN_TUJUAN_AMAN = ["/akun", "/checkout", "/keranjang", "/admin", "/produk"];

/** Hanya izinkan redirect ke path internal yang dikenal (mencegah open redirect). */
export function tujuanAman(path: string | null | undefined, cadangan: string): string {
  if (!path || typeof path !== "string") return cadangan;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes(":")) {
    return cadangan;
  }
  if (!/^[\w\-/?=&%.]*$/.test(path)) return cadangan;
  const cocok = AWALAN_TUJUAN_AMAN.some((awal) => path === awal || path.startsWith(`${awal}/`) || path.startsWith(`${awal}?`));
  return cocok ? path : cadangan;
}

// ---------- Keranjang & checkout ----------

export const skemaAksiKeranjang = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce
    .number()
    .int({ error: "Jumlah harus bilangan bulat" })
    .min(0, { error: "Jumlah tidak boleh negatif" })
    .max(MAKS_JUMLAH_PER_PRODUK, { error: `Jumlah maksimal ${MAKS_JUMLAH_PER_PRODUK}` }),
});

export { POLA_HP };

export const skemaCheckout = z.object({
  recipientName: teks(3, 80, "Nama penerima"),
  phone: z
    .string({ error: "Nomor HP wajib diisi" })
    .transform(normalkanHp)
    .pipe(z.string().regex(POLA_HP, { error: "Nomor HP tidak valid (contoh: 081234567890)" })),
  addressLine: teks(10, 300, "Alamat lengkap"),
  city: teks(3, 80, "Kota/kabupaten"),
  province: z.enum(NAMA_PROVINSI, { error: "Pilih provinsi tujuan" }),
  postalCode: z
    .string({ error: "Kode pos wajib diisi" })
    .trim()
    .regex(POLA_KODE_POS, { error: "Kode pos harus 5 digit angka" }),
  shippingService: z.enum(LAYANAN_IDS, { error: "Pilih layanan pengiriman" }),
  paymentMethod: z.enum(METODE_PEMBAYARAN, { error: "Pilih metode pembayaran" }),
  note: z.string().trim().max(300, { error: "Catatan maksimal 300 karakter" }).optional().default(""),
});

export type DataCheckout = z.infer<typeof skemaCheckout>;

export const POLA_KODE_PESANAN = /^LK\d{6}-[A-Z0-9]{4}$/;
export const skemaKodePesanan = z.string().trim().toUpperCase().regex(POLA_KODE_PESANAN);

// ---------- Katalog ----------

export const URUTAN_KATALOG = ["terbaru", "terlaris", "harga-terendah", "harga-tertinggi", "nama"] as const;
export type UrutanKatalog = (typeof URUTAN_KATALOG)[number];

export const LABEL_URUTAN: Record<UrutanKatalog, string> = {
  terbaru: "Terbaru",
  terlaris: "Terlaris",
  "harga-terendah": "Harga terendah",
  "harga-tertinggi": "Harga tertinggi",
  nama: "Nama (A–Z)",
};

const satuNilai = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const angkaHarga = z.preprocess(
  (v) => {
    const s = satuNilai(v);
    if (typeof s !== "string" || s.trim() === "") return undefined;
    return parseRupiah(s) ?? undefined;
  },
  z.number().int().min(0).max(100_000_000).optional(),
);

export const skemaQueryKatalog = z.object({
  q: z.preprocess(satuNilai, z.string().trim().max(80).optional()).catch(undefined),
  kategori: z.preprocess(satuNilai, z.string().max(80).regex(POLA_SLUG).optional()).catch(undefined),
  min: angkaHarga.catch(undefined),
  max: angkaHarga.catch(undefined),
  urut: z.preprocess(satuNilai, z.enum(URUTAN_KATALOG)).catch("terbaru"),
  tersedia: z.preprocess((v) => satuNilai(v) === "1", z.boolean()).catch(false),
  hal: z.preprocess(satuNilai, z.coerce.number().int().min(1).max(500)).catch(1),
});

export type QueryKatalog = z.infer<typeof skemaQueryKatalog>;

// ---------- Admin ----------

export const skemaProduk = z.object({
  name: teks(3, 120, "Nama produk"),
  slug: opsional(
    z
      .string()
      .trim()
      .toLowerCase()
      .max(80, { error: "Slug maksimal 80 karakter" })
      .regex(POLA_SLUG, { error: "Slug hanya huruf kecil, angka, dan tanda hubung" }),
  ),
  categoryId: z.coerce.number({ error: "Pilih kategori" }).int().positive({ error: "Pilih kategori" }),
  price: z
    .string({ error: "Harga wajib diisi" })
    .transform((s) => parseRupiah(s))
    .pipe(
      z
        .number({ error: "Harga wajib diisi dengan angka" })
        .int()
        .min(1_000, { error: "Harga minimal Rp1.000" })
        .max(100_000_000, { error: "Harga maksimal Rp100.000.000" }),
    ),
  stock: z.coerce
    .number({ error: "Stok wajib diisi dengan angka" })
    .int({ error: "Stok harus bilangan bulat" })
    .min(0, { error: "Stok tidak boleh negatif" })
    .max(100_000, { error: "Stok maksimal 100.000" }),
  weightGrams: z.coerce
    .number({ error: "Berat wajib diisi dengan angka" })
    .int({ error: "Berat harus bilangan bulat (gram)" })
    .min(1, { error: "Berat minimal 1 gram" })
    .max(50_000, { error: "Berat maksimal 50.000 gram" }),
  description: teks(20, 2000, "Deskripsi"),
  isActive: kotakCentang,
  isFeatured: kotakCentang,
});

export type DataProduk = z.infer<typeof skemaProduk>;

export const skemaKategori = z.object({
  name: teks(3, 60, "Nama kategori"),
  slug: opsional(
    z
      .string()
      .trim()
      .toLowerCase()
      .max(60, { error: "Slug maksimal 60 karakter" })
      .regex(POLA_SLUG, { error: "Slug hanya huruf kecil, angka, dan tanda hubung" }),
  ),
  description: z.string().trim().max(300, { error: "Deskripsi maksimal 300 karakter" }).default(""),
});

export const skemaIdAngka = z.coerce.number().int().positive();

export const skemaUbahStatus = z.object({
  code: skemaKodePesanan,
  status: z.enum(STATUS_PESANAN),
  note: z.string().trim().max(200, { error: "Catatan maksimal 200 karakter" }).optional().default(""),
});

export const skemaFilterPesananAdmin = z.object({
  status: z.preprocess(satuNilai, z.enum(STATUS_PESANAN).optional()).catch(undefined),
  q: z.preprocess(satuNilai, z.string().trim().toUpperCase().max(20).optional()).catch(undefined),
  hal: z.preprocess(satuNilai, z.coerce.number().int().min(1).max(500)).catch(1),
});

/** Ubah FormData menjadi objek biasa (nilai File diabaikan). */
export function formKeObjek(formData: FormData): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const [kunci, nilai] of formData.entries()) {
    if (typeof nilai === "string" && !(kunci in hasil)) hasil[kunci] = nilai;
  }
  return hasil;
}

/** Pesan galat per kolom dari ZodError, mengambil pesan pertama tiap kolom. */
export function galatPerKolom(error: z.ZodError): Record<string, string> {
  const datar = z.flattenError(error);
  const hasil: Record<string, string> = {};
  for (const [kolom, pesan] of Object.entries(datar.fieldErrors)) {
    const pertama = (pesan as string[] | undefined)?.[0];
    if (pertama) hasil[kolom] = pertama;
  }
  if (datar.formErrors[0]) hasil._form = datar.formErrors[0];
  return hasil;
}

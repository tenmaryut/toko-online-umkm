/**
 * Ongkos kirim tetap per zona. Tidak memakai API kurir: tarif ditentukan oleh zona tujuan
 * (kelompok provinsi) dan layanan yang dipilih, tidak bergantung pada berat.
 */

export const ZONA_IDS = ["zona-1", "zona-2", "zona-3", "zona-4"] as const;
export type ZonaId = (typeof ZONA_IDS)[number];

export const LAYANAN_IDS = ["reguler", "kilat"] as const;
export type LayananId = (typeof LAYANAN_IDS)[number];

export const ZONA: Record<ZonaId, { nama: string; wilayah: string }> = {
  "zona-1": { nama: "Zona 1", wilayah: "Pulau Jawa" },
  "zona-2": { nama: "Zona 2", wilayah: "Sumatra, Bali, dan Nusa Tenggara" },
  "zona-3": { nama: "Zona 3", wilayah: "Kalimantan dan Sulawesi" },
  "zona-4": { nama: "Zona 4", wilayah: "Maluku dan Papua" },
};

export const LAYANAN: Record<LayananId, { nama: string; keterangan: string }> = {
  reguler: { nama: "Reguler", keterangan: "Pengiriman standar" },
  kilat: { nama: "Kilat", keterangan: "Diproses dan dikirim lebih cepat" },
};

/** Tarif tetap dalam Rupiah dan estimasi waktu tiba (hari kerja). */
export const TARIF: Record<ZonaId, Record<LayananId, { biaya: number; estimasi: string }>> = {
  "zona-1": {
    reguler: { biaya: 12_000, estimasi: "2–3 hari" },
    kilat: { biaya: 22_000, estimasi: "1 hari" },
  },
  "zona-2": {
    reguler: { biaya: 24_000, estimasi: "3–5 hari" },
    kilat: { biaya: 39_000, estimasi: "1–2 hari" },
  },
  "zona-3": {
    reguler: { biaya: 32_000, estimasi: "4–6 hari" },
    kilat: { biaya: 52_000, estimasi: "2–3 hari" },
  },
  "zona-4": {
    reguler: { biaya: 48_000, estimasi: "5–8 hari" },
    kilat: { biaya: 79_000, estimasi: "3–4 hari" },
  },
};

/** 38 provinsi Indonesia beserta zonanya. */
export const PROVINSI = [
  { nama: "Aceh", zona: "zona-2" },
  { nama: "Sumatera Utara", zona: "zona-2" },
  { nama: "Sumatera Barat", zona: "zona-2" },
  { nama: "Riau", zona: "zona-2" },
  { nama: "Kepulauan Riau", zona: "zona-2" },
  { nama: "Jambi", zona: "zona-2" },
  { nama: "Sumatera Selatan", zona: "zona-2" },
  { nama: "Kepulauan Bangka Belitung", zona: "zona-2" },
  { nama: "Bengkulu", zona: "zona-2" },
  { nama: "Lampung", zona: "zona-2" },
  { nama: "Jakarta", zona: "zona-1" },
  { nama: "Jawa Barat", zona: "zona-1" },
  { nama: "Banten", zona: "zona-1" },
  { nama: "Jawa Tengah", zona: "zona-1" },
  { nama: "DI Yogyakarta", zona: "zona-1" },
  { nama: "Jawa Timur", zona: "zona-1" },
  { nama: "Bali", zona: "zona-2" },
  { nama: "Nusa Tenggara Barat", zona: "zona-2" },
  { nama: "Nusa Tenggara Timur", zona: "zona-2" },
  { nama: "Kalimantan Barat", zona: "zona-3" },
  { nama: "Kalimantan Tengah", zona: "zona-3" },
  { nama: "Kalimantan Selatan", zona: "zona-3" },
  { nama: "Kalimantan Timur", zona: "zona-3" },
  { nama: "Kalimantan Utara", zona: "zona-3" },
  { nama: "Sulawesi Utara", zona: "zona-3" },
  { nama: "Gorontalo", zona: "zona-3" },
  { nama: "Sulawesi Tengah", zona: "zona-3" },
  { nama: "Sulawesi Barat", zona: "zona-3" },
  { nama: "Sulawesi Selatan", zona: "zona-3" },
  { nama: "Sulawesi Tenggara", zona: "zona-3" },
  { nama: "Maluku", zona: "zona-4" },
  { nama: "Maluku Utara", zona: "zona-4" },
  { nama: "Papua", zona: "zona-4" },
  { nama: "Papua Barat", zona: "zona-4" },
  { nama: "Papua Barat Daya", zona: "zona-4" },
  { nama: "Papua Tengah", zona: "zona-4" },
  { nama: "Papua Pegunungan", zona: "zona-4" },
  { nama: "Papua Selatan", zona: "zona-4" },
] as const satisfies readonly { nama: string; zona: ZonaId }[];

export type NamaProvinsi = (typeof PROVINSI)[number]["nama"];

export const NAMA_PROVINSI = PROVINSI.map((p) => p.nama) as [NamaProvinsi, ...NamaProvinsi[]];

export function isLayanan(nilai: string): nilai is LayananId {
  return (LAYANAN_IDS as readonly string[]).includes(nilai);
}

/** Zona untuk sebuah provinsi, atau null kalau nama provinsi tidak dikenal. */
export function zonaUntukProvinsi(provinsi: string): ZonaId | null {
  const ditemukan = PROVINSI.find((p) => p.nama === provinsi);
  return ditemukan ? ditemukan.zona : null;
}

/** Ongkir tetap untuk zona dan layanan tertentu. */
export function hitungOngkir(zona: ZonaId, layanan: LayananId): number {
  return TARIF[zona][layanan].biaya;
}

export type PilihanPengiriman = {
  layanan: LayananId;
  nama: string;
  keterangan: string;
  biaya: number;
  estimasi: string;
};

/** Semua pilihan layanan untuk sebuah zona, urut dari termurah. */
export function pilihanPengiriman(zona: ZonaId): PilihanPengiriman[] {
  return LAYANAN_IDS.map((layanan) => ({
    layanan,
    nama: LAYANAN[layanan].nama,
    keterangan: LAYANAN[layanan].keterangan,
    biaya: TARIF[zona][layanan].biaya,
    estimasi: TARIF[zona][layanan].estimasi,
  })).sort((a, b) => a.biaya - b.biaya);
}

/**
 * Menghitung ongkir dari nama provinsi dan layanan. Melempar error kalau provinsi
 * atau layanan tidak valid, supaya checkout tidak pernah memakai ongkir 0 secara diam-diam.
 */
export function kutipOngkir(
  provinsi: string,
  layanan: string,
): { zona: ZonaId; layanan: LayananId; biaya: number; estimasi: string } {
  const zona = zonaUntukProvinsi(provinsi);
  if (!zona) throw new Error(`Provinsi tidak dikenal: ${provinsi}`);
  if (!isLayanan(layanan)) throw new Error(`Layanan pengiriman tidak dikenal: ${layanan}`);
  const tarif = TARIF[zona][layanan];
  return { zona, layanan, biaya: tarif.biaya, estimasi: tarif.estimasi };
}

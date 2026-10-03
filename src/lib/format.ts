const ZONA_WAKTU = "Asia/Jakarta";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const angkaFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** Format nominal Rupiah gaya Indonesia, mis. 15000 → "Rp 15.000" (spasi tak terputus). */
export function formatRupiah(nominal: number): string {
  if (!Number.isFinite(nominal)) {
    throw new RangeError("Nominal harus berupa angka yang valid");
  }
  return rupiahFormatter.format(Math.round(nominal));
}

/** Format angka dengan pemisah ribuan titik, mis. 1250 → "1.250". */
export function formatAngka(nilai: number): string {
  return angkaFormatter.format(nilai);
}

/**
 * Mengubah masukan harga dari admin ("Rp 15.000", "15.000", "15000") menjadi bilangan bulat.
 * Mengembalikan null kalau tidak ada digit sama sekali.
 */
export function parseRupiah(masukan: string): number | null {
  const digit = masukan.replace(/[^\d]/g, "");
  if (digit.length === 0 || digit.length > 12) return null;
  return Number.parseInt(digit, 10);
}

/** Format berat dalam gram: 1500 → "1,5 kg", 250 → "250 g". */
export function formatBerat(gram: number): string {
  if (gram >= 1000) {
    const kg = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(gram / 1000);
    return `${kg} kg`;
  }
  return `${formatAngka(gram)} g`;
}

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA_WAKTU,
});

const tanggalJamFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA_WAKTU,
});

const tanggalPendekFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: ZONA_WAKTU,
});

/** "2 Oktober 2026" */
export function formatTanggal(tanggal: Date): string {
  return tanggalFormatter.format(tanggal);
}

/** "2 Okt 2026, 21.15 WIB" */
export function formatTanggalJam(tanggal: Date): string {
  return `${tanggalJamFormatter.format(tanggal)} WIB`;
}

/** "2 Okt" — dipakai pada sumbu grafik. */
export function formatTanggalPendek(tanggal: Date): string {
  return tanggalPendekFormatter.format(tanggal);
}

/** Kunci hari (YYYY-MM-DD) menurut WIB, untuk mengelompokkan penjualan per hari. */
export function kunciHariWIB(tanggal: Date): string {
  const bagian = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ZONA_WAKTU,
  }).format(tanggal);
  return bagian; // en-CA menghasilkan format YYYY-MM-DD
}

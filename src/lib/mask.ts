/**
 * Penyamaran data pribadi. Admin demo memakai kredensial publik, jadi data pelanggan
 * yang mendaftar sendiri ditampilkan tersamar (prinsip minimisasi data, UU 27/2022 tentang
 * Pelindungan Data Pribadi). Admin asli melihat data lengkap.
 */

function samarkanBagian(teks: string, tampilDepan: number): string {
  if (teks.length <= tampilDepan) return `${teks.slice(0, 1)}${"*".repeat(Math.max(teks.length - 1, 1))}`;
  return `${teks.slice(0, tampilDepan)}${"*".repeat(teks.length - tampilDepan)}`;
}

/** "budi.santoso@example.com" → "bu**********@e******.com" */
export function samarkanEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return samarkanBagian(email, 1);
  const lokal = email.slice(0, at);
  const domain = email.slice(at + 1);
  const titik = domain.lastIndexOf(".");
  const namaDomain = titik > 0 ? domain.slice(0, titik) : domain;
  const tld = titik > 0 ? domain.slice(titik) : "";
  return `${samarkanBagian(lokal, 2)}@${samarkanBagian(namaDomain, 1)}${tld}`;
}

/** "081234567890" → "0812******90" */
export function samarkanTelepon(telepon: string): string {
  const digit = telepon.replace(/\s+/g, "");
  if (digit.length <= 6) return "*".repeat(digit.length);
  return `${digit.slice(0, 4)}${"*".repeat(digit.length - 6)}${digit.slice(-2)}`;
}

/** Nama: huruf pertama tiap kata saja. "Budi Santoso" → "B*** S******" */
export function samarkanNama(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .map((kata) => samarkanBagian(kata, 1))
    .join(" ");
}

/** Alamat jalan disembunyikan seluruhnya; kota/provinsi tetap terlihat di tempat lain. */
export function samarkanAlamat(alamat: string): string {
  return alamat.trim().length > 0 ? "[alamat disamarkan untuk admin demo]" : "";
}

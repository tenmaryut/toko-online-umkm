export const STATUS_PESANAN = [
  "menunggu_pembayaran",
  "dibayar",
  "dikemas",
  "dikirim",
  "selesai",
  "dibatalkan",
] as const;

export type StatusPesanan = (typeof STATUS_PESANAN)[number];

export const LABEL_STATUS: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "Menunggu pembayaran",
  dibayar: "Dibayar",
  dikemas: "Dikemas",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

/** Label tombol aksi admin untuk berpindah ke status tujuan. */
export const LABEL_AKSI_ADMIN: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "Kembalikan ke menunggu pembayaran",
  dibayar: "Tandai dibayar",
  dikemas: "Tandai dikemas",
  dikirim: "Tandai dikirim",
  selesai: "Tandai selesai",
  dibatalkan: "Batalkan pesanan",
};

/** Status yang dihitung sebagai penjualan (sudah dibayar). */
export const STATUS_TERBAYAR: readonly StatusPesanan[] = ["dibayar", "dikemas", "dikirim", "selesai"];

/** Alur status yang boleh dilakukan admin. */
const TRANSISI_ADMIN: Record<StatusPesanan, readonly StatusPesanan[]> = {
  menunggu_pembayaran: ["dibayar", "dibatalkan"],
  dibayar: ["dikemas", "dibatalkan"],
  dikemas: ["dikirim", "dibatalkan"],
  dikirim: ["selesai"],
  selesai: [],
  dibatalkan: [],
};

export type Pelaku = "admin" | "pelanggan";

export function isStatusPesanan(nilai: string): nilai is StatusPesanan {
  return (STATUS_PESANAN as readonly string[]).includes(nilai);
}

/** Status tujuan yang diizinkan dari status saat ini untuk pelaku tertentu. */
export function transisiBerikutnya(dari: StatusPesanan, pelaku: Pelaku): readonly StatusPesanan[] {
  if (pelaku === "admin") return TRANSISI_ADMIN[dari];
  // Pelanggan hanya bisa membayar (simulasi) atau membatalkan pesanan yang belum dibayar.
  return dari === "menunggu_pembayaran" ? ["dibayar", "dibatalkan"] : [];
}

export function bolehUbahStatus(dari: StatusPesanan, ke: StatusPesanan, pelaku: Pelaku): boolean {
  return transisiBerikutnya(dari, pelaku).includes(ke);
}

/** Pembatalan mengembalikan stok selama barang belum dikirim. */
export function kembalikanStokSaatBatal(dari: StatusPesanan): boolean {
  return dari === "menunggu_pembayaran" || dari === "dibayar" || dari === "dikemas";
}

/** Urutan langkah untuk linimasa pesanan di halaman pelanggan. */
export const LANGKAH_PESANAN: readonly StatusPesanan[] = [
  "menunggu_pembayaran",
  "dibayar",
  "dikemas",
  "dikirim",
  "selesai",
];

export const METODE_PEMBAYARAN = ["transfer_va", "qris", "ewallet"] as const;
export type MetodePembayaran = (typeof METODE_PEMBAYARAN)[number];

export const LABEL_PEMBAYARAN: Record<MetodePembayaran, string> = {
  transfer_va: "Transfer bank (virtual account simulasi)",
  qris: "QRIS (simulasi)",
  ewallet: "Dompet digital (simulasi)",
};

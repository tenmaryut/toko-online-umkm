export const SITUS = {
  nama: "Lumbung Kabut",
  tagline: "Hasil kebun dan dapur dari lereng berkabut",
  deskripsi:
    "Toko online demo milik UMKM fiktif Lumbung Kabut: kopi, teh rempah, camilan, sambal, dan kriya dapur. Dibuat untuk portofolio, tanpa transaksi nyata.",
  bannerDemo: "Toko demo portofolio. Tidak ada transaksi nyata.",
  peringatanForm: "Situs demo: jangan masukkan data pribadi asli (nama, alamat, nomor HP, atau email pribadi).",
} as const;

/**
 * URL publik situs, dibaca saat runtime dari SITE_URL. Di server, nilainya diisi deploy/deploy.sh
 * dari TOKO_URL di /root/tenma-ws/portofolio/domain.env (satu-satunya sumber alamat situs).
 */
export function urlSitus(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/** Nama host situs tanpa protokol, mis. untuk teks di gambar Open Graph. */
export function hostSitus(): string {
  return new URL(urlSitus()).host;
}

/** URL situs portofolio pembuat (PORTOFOLIO_URL dari domain.env), atau null kalau tidak diatur. */
export function urlPortofolio(): string | null {
  const url = process.env.PORTOFOLIO_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

export function urlAbsolut(path: string): string {
  return `${urlSitus()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Akun demo yang sengaja ditampilkan di halaman masuk. Datanya direset tiap malam
 * oleh systemd timer. Akun admin asli TIDAK ada di sini; kredensialnya disimpan di luar repo.
 */
export const AKUN_DEMO = {
  pelanggan: {
    nama: "Pelanggan Demo",
    email: "demo@lumbung-kabut.test",
    password: "pelanggan123",
  },
  admin: {
    nama: "Admin Demo",
    email: "admin-demo@lumbung-kabut.test",
    password: "admindemo123",
  },
} as const;

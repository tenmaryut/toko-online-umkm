import type { Metadata } from "next";
import Link from "next/link";
import { urlPortofolio } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang demo ini",
  description:
    "Lumbung Kabut adalah toko online demo untuk portofolio: Next.js, TypeScript, SQLite, autentikasi, checkout simulasi, dan dasbor admin. Tidak ada transaksi nyata.",
  alternates: { canonical: "/tentang" },
};

const FITUR = [
  ["Katalog", "Kategori, pencarian, filter harga dan ketersediaan, urutan, halaman detail, harga Rupiah format Indonesia."],
  ["Keranjang & checkout", "Keranjang tersimpan di cookie, ongkir tetap per zona (4 zona, 38 provinsi), pembayaran simulasi, stok berkurang saat pesanan dibuat."],
  ["Akun pelanggan", "Daftar, masuk, riwayat pesanan, linimasa status, pembatalan pesanan yang belum dibayar."],
  ["Dasbor admin", "Grafik penjualan, kelola produk (termasuk unggah gambar) dan kategori, ubah status pesanan, daftar pelanggan."],
  ["Keamanan", "Kata sandi di-hash (scrypt), area admin dijaga di server, rate limit login, validasi Zod di setiap input, CSP dengan nonce."],
  ["SEO", "Meta per produk, Open Graph, sitemap, data terstruktur Product, halaman 404 dan 500 khusus."],
];

export default function HalamanTentang() {
  const portofolio = urlPortofolio();
  return (
    <div className="wadah max-w-3xl py-10 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lumut">Tentang demo</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Toko contoh, alur belanja sungguhan</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-arang-2">
        <p>
          <strong className="text-arang">Lumbung Kabut</strong> adalah merek UMKM fiktif. Situs ini dibuat sebagai proyek portofolio
          untuk menunjukkan aplikasi toko online full-stack: database, autentikasi, logika bisnis, dan dasbor admin.
        </p>
        <p>
          Semua produk, harga, stok, pelanggan, dan pesanan adalah data contoh. Tidak ada barang yang dijual, tidak ada uang yang
          berpindah, dan tidak ada paket yang dikirim. Ilustrasi kemasan dibuat sendiri dalam format SVG.
        </p>
        <p>
          Setiap pukul 00.00 WIB, data demo dikembalikan ke keadaan awal: pesanan baru, akun yang didaftarkan pengunjung, dan
          gambar unggahan dihapus otomatis.
        </p>
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold">Yang bisa dicoba</h2>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FITUR.map(([judul, isi]) => (
          <div key={judul} className="kartu p-4">
            <dt className="font-semibold">{judul}</dt>
            <dd className="mt-1 text-sm text-arang-2">{isi}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 font-display text-2xl font-semibold">Teknologi</h2>
      <p className="mt-3 text-arang-2">
        Next.js (App Router) dan TypeScript strict, Tailwind CSS, Drizzle ORM dengan SQLite, Better Auth, dan Zod. Diuji dengan
        Vitest dan Playwright, lalu dijalankan sebagai layanan systemd di belakang Caddy (HTTPS).
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/masuk" className="tombol-utama">
          Coba dengan akun demo
        </Link>
        {portofolio && (
          <a href={portofolio} className="tombol-garis">
            Portofolio pembuat
          </a>
        )}
      </div>
    </div>
  );
}

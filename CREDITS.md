# Kredit dan lisensi aset

## Gambar dan ilustrasi

Semua gambar di situs ini **dibuat sendiri** sebagai kode SVG. Tidak ada foto, stok gambar, atau ilustrasi pihak ketiga.

| Aset | Sumber |
|---|---|
| Ilustrasi kemasan 26 produk (`public/images/produk/*.svg`) dan kemasan polos (`public/images/produk-polos.svg`) | Dibuat sendiri; dihasilkan oleh `src/lib/product-art.ts` lewat `npm run art` |
| Ilustrasi lereng berkabut, lumbung, dan halaman 404/500 | Dibuat sendiri (`src/components/ilustrasi.tsx`, `src/app/error.tsx`) |
| Logo/tanda lumbung dan favicon (`src/app/icon.svg`) | Dibuat sendiri (`src/components/logo.tsx`) |
| Ikon antarmuka | Dibuat sendiri (`src/components/ikon.tsx`) |
| Gambar Open Graph (`/og/...`) | Dibuat saat runtime dari ilustrasi di atas dengan `next/og` |
| Gambar yang diunggah pengunjung lewat admin demo | Milik pengunggah; dihapus otomatis setiap pukul 00.00 WIB |

## Font

| Font | Pembuat | Lisensi |
|---|---|---|
| Plus Jakarta Sans | Tokotype | SIL Open Font License 1.1 |
| Fraunces | Undercase Type | SIL Open Font License 1.1 |

Font diambil dari Google Fonts saat build oleh `next/font` dan disajikan dari server sendiri (tanpa permintaan ke Google saat situs dibuka).

## Merek dan konten

- **Lumbung Kabut** adalah merek fiktif. Pada 2 Oktober 2026 nama ini dicek lewat pencarian web dan tidak ditemukan dipakai usaha nyata (yang mirip hanya "Lumbung Coffee", nama berbeda).
- Produk, harga, stok, pelanggan, dan pesanan adalah data contoh. Nama produk sengaja tidak memakai nama indikasi geografis terdaftar, dan deskripsinya tanpa klaim kesehatan.
- Email contoh memakai domain `.test` yang dicadangkan untuk pengujian (RFC 2606).

## Pustaka utama

| Pustaka | Lisensi |
|---|---|
| Next.js, React, Tailwind CSS, Better Auth, Zod, better-sqlite3, Vitest, esbuild, drizzle-kit, tsx | MIT |
| Drizzle ORM, sharp, Playwright | Apache-2.0 |

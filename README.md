# Lumbung Kabut · toko online UMKM (demo portofolio)

Toko online full-stack untuk UMKM fiktif **Lumbung Kabut** (kopi, teh rempah, camilan, sambal, dan kriya dapur): katalog, keranjang, checkout dengan ongkir per zona dan pembayaran simulasi, akun pelanggan, serta dasbor admin. **Tidak ada transaksi nyata.**

- Demo: https://toko.tail482cb9.ts.net (nilai `TOKO_URL` di `/root/tenma-ws/portofolio/domain.env`; lihat "Pindah domain").
- Akun demo (ditampilkan juga di halaman masuk; data direset setiap pukul 00.00 WIB):
  - Pelanggan: `demo@lumbung-kabut.test` / `pelanggan123`
  - Admin: `admin-demo@lumbung-kabut.test` / `admindemo123`

## Fitur

- **Katalog**: kategori, pencarian, filter harga dan ketersediaan, urutan, paginasi, detail produk. Harga format Rupiah id-ID.
- **Keranjang & checkout**: keranjang di cookie (bertahan setelah reload), ongkir tetap per zona (4 zona, 38 provinsi, layanan Reguler/Kilat), ringkasan, pembayaran simulasi (VA/QRIS/dompet digital). Stok berkurang dalam transaksi saat pesanan dibuat; pembatalan sebelum dikirim mengembalikan stok.
- **Akun pelanggan**: daftar, masuk, riwayat dan linimasa status pesanan.
- **Dasbor admin**: ringkasan + grafik pendapatan 14 hari, kelola produk (unggah gambar) dan kategori, ubah status pesanan (dibayar → dikemas → dikirim → selesai), daftar pelanggan.
- **Keamanan**: kata sandi di-hash (scrypt, Better Auth), area admin dijaga di server (layout + setiap Server Action), rate limit login/daftar/checkout/aksi admin, validasi Zod di setiap input, honeypot anti-spam, CSP dengan nonce per request, unggahan divalidasi isi file dan ukurannya lalu dikonversi ke WebP tanpa metadata dan disimpan di luar folder build. Admin demo melihat data pribadi pengunjung secara tersamar (UU 27/2022).
- **SEO**: meta dan Open Graph per produk, sitemap, robots, data terstruktur `Product` dan `BreadcrumbList`, halaman 404 dan 500 khusus.
- **Animasi** (CSS transform/opacity, patuh CSP): tombol tambah berubah jadi centang, lencana keranjang memantul, keranjang mini meluncur masuk; grid produk muncul bertahap saat dimuat dan saat filter berubah, gambar membesar sedikit saat hover/fokus; skeleton berkilau saat katalog memuat; toast notifikasi; progres langkah checkout dan linimasa status pesanan; grafik admin tergambar bertahap dan angka ringkasan menghitung naik. Semua dimatikan bila pengguna memilih `prefers-reduced-motion: reduce`, dan konten tetap tampil penuh tanpa JavaScript. Rekaman WebM ada di `docs/animasi/`.

## Stack

Next.js 16 (App Router, output standalone) · TypeScript strict · Tailwind CSS 4 · Drizzle ORM + SQLite (better-sqlite3) · Better Auth · Zod 4 · sharp · Vitest · Playwright. Produksi: systemd (`web-toko-online-umkm.service`, user dinamis non-root) di `127.0.0.1:3003` di belakang Caddy.

## Menjalankan di lokal

```bash
npm install
cp .env.example .env.local      # isi BETTER_AUTH_SECRET dengan string acak ≥ 32 karakter
npm run db:setup                # migrasi + data demo ke ./data/toko.db
npm run dev                     # http://localhost:3000
```

Perintah lain: `npm run db:reset` (kembalikan data demo), `npm run art` (buat ulang ilustrasi produk), `npm run db:generate` (migrasi baru setelah mengubah `src/db/schema.ts`).

## Test

```bash
npm run typecheck && npm run lint
npm test                        # Vitest: format harga, keranjang, ongkir, validasi, pesanan & stok
npm run build                   # build standalone (diperlukan oleh test e2e)
npm run test:e2e                # Playwright: jelajah → keranjang → checkout → admin ubah status, keamanan, SEO, gerak, proxy
npm run test:e2e:publik         # test e2e yang sama terhadap URL publik (TOKO_URL dari domain.env)
npm run uji-rate-limit          # uji rate limit per pengunjung lewat http://127.0.0.1:80 (Caddy) dengan X-Forwarded-For berbeda
npm run screenshots             # cek responsif 360–1440 px + screenshot ke docs/screenshots/
npm run rekam-animasi           # rekaman WebM animasi utama ke docs/animasi/
```

Test gerak (`tests/e2e/gerak.spec.ts`, bagian dari `npm run test:e2e`) membuktikan animasi aktif secara normal dan mati saat reduced motion diemulasikan.

Hasil Lighthouse mobile terhadap URL publik ada di `docs/lighthouse/`.

## Deploy

```bash
npm run deploy                  # sebagai root: baca domain.env, build, salin ke /srv/web/toko-online-umkm, pasang unit systemd & Caddy
systemctl status web-toko-online-umkm
journalctl -u web-toko-online-umkm -n 50
systemctl list-timers web-toko-online-umkm-reset.timer
```

- Hasil build: `/srv/web/toko-online-umkm` (milik root, hanya-baca untuk layanan). Data runtime (SQLite + unggahan): `/var/lib/web-toko-online-umkm`.
- Secret aplikasi: `/etc/web-toko-online-umkm/env` (600). Kredensial admin asli: `/root/tenma-ws/portofolio/rahasia/toko-online-umkm.txt` (600), dibaca layanan lewat `LoadCredential`.
- Reset data demo: `web-toko-online-umkm-reset.timer` setiap 00.00 WIB (admin asli dipertahankan).
- File Caddy `/etc/caddy/sites/toko-online-umkm.caddy` dibuat dari `deploy/toko-online-umkm.caddy.template` dengan alamat `http://<host TOKO_URL>`; baris pertama blok situsnya `import gerbang_staging` (snippet di `/etc/caddy/Caddyfile` yang membuang header identitas akun Tailscale).

## Di balik proxy (Tailscale Funnel)

Situs dibuka publik lewat Tailscale Funnel, yang menangani HTTPS dan menyembunyikan IP server:
pengunjung → Funnel → Caddy di `127.0.0.1:80` (mode tunnel, `trusted_proxies` 127.0.0.1) → aplikasi di `127.0.0.1:3003`.

- **IP pengunjung asli**: proxy yang dipercaya hanya loopback (Funnel dan Caddy di server yang sama; aplikasi pun hanya mendengarkan 127.0.0.1). `ipKlien()` di `src/lib/rate-limit.ts` menelusuri `X-Forwarded-For` dari kanan dan melewati entri loopback, jadi IP yang ditambahkan Funnel yang dipakai untuk rate limit dan sesi. Nilai palsu yang dikirim pengunjung di sisi kiri header diabaikan. Header `Tailscale-User-*` dibuang Caddy dan tidak dipakai aplikasi.
- **Skema https**: semua URL absolut (canonical, Open Graph, sitemap, data terstruktur) dibangun dari `SITE_URL` (https, dari domain.env); cookie sesi `__Secure-lk.session_token` dan cookie keranjang memakai atribut `Secure`; redirect memakai path relatif sehingga tetap di origin publik; CSP memuat `upgrade-insecure-requests`, dan halaman tidak memuat aset `http://`.
- **Bukti**: `npm run uji-rate-limit` (hasil sebelum/sesudah perbaikan di `docs/proxy/`) dan `tests/e2e/proxy.spec.ts` (cookie `Secure`, URL absolut, redirect, tanpa mixed content).

## Pindah domain

Satu-satunya sumber alamat adalah `/root/tenma-ws/portofolio/domain.env` (`TOKO_URL`, juga `PORTOFOLIO_URL` untuk tautan ke portofolio). Kode, konten, dan file deploy tidak menyimpan alamat apa pun.

1. Ubah `TOKO_URL` (format `https://nama-host`, tanpa path) di `domain.env`.
2. Deploy ulang: `cd /root/tenma-ws/projects/toko-online-umkm && npm run deploy`. Skrip menulis `SITE_URL`/`PORTOFOLIO_URL` ke `/etc/web-toko-online-umkm/env`, membuat ulang file Caddy dari template dengan host baru, lalu me-restart layanan.
3. Reload Caddy (sudah dilakukan skrip): `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`.
4. Sesuaikan jalur masuk publik: dalam mode tunnel, Tailscale Funnel untuk host baru diatur agen utama; bila kelak memakai domain sendiri langsung ke server, Caddy kembali menangani HTTPS (alamat situs di template tanpa `http://`).

## Catatan

- Rate limit disimpan di memori proses (cukup untuk satu instance); reset saat layanan dimulai ulang.
- Admin demo bersifat publik, jadi siapa pun bisa mengubah data demo; semuanya dikembalikan otomatis tiap malam.

## Status

Selesai sebagai demo portofolio (Oktober 2026).

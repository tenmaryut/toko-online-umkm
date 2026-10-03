# toko-online-umkm (Lumbung Kabut)

Toko online demo untuk portofolio Tenma: Next.js 16 App Router + TypeScript strict + Tailwind 4 + Drizzle/SQLite + Better Auth + Zod. Brief dan progress: `/root/tenma-ws/portofolio/brief-toko-online-umkm.md`, `/root/tenma-ws/portofolio/progress/toko-online-umkm.md`.

@AGENTS.md

## Perintah

- Dev: `npm run dev` (port 3000, butuh `.env.local`, lihat `.env.example`), data: `npm run db:setup` / `npm run db:reset`
- Cek: `npm run typecheck`, `npm run lint`, `npm test` (Vitest), `npm run build` lalu `npm run test:e2e` dan `npm run screenshots` (Playwright, port 3000, DB `data/e2e/`)
- Rekaman animasi: `npm run rekam-animasi` (butuh build) → `docs/animasi/*.webm`
- Deploy (root): `npm run deploy` → baca `/root/tenma-ws/portofolio/domain.env`, `/srv/web/toko-online-umkm`, layanan `web-toko-online-umkm` (127.0.0.1:3003), timer `web-toko-online-umkm-reset`, Caddy `/etc/caddy/sites/toko-online-umkm.caddy` dirender dari `deploy/toko-online-umkm.caddy.template`

## Struktur

- `src/app/(toko)/` halaman toko, `src/app/admin/` dasbor, `src/actions/` Server Action, `src/db/` skema/kueri/seed/pesanan, `src/lib/` logika murni (keranjang, ongkir, format, validasi, rate limit, penyamaran).
- `scripts/db-setup.ts` (ExecStartPre: migrasi, seed bila kosong, admin asli dari LoadCredential), `scripts/reset-demo.ts` (timer malam), `scripts/postbuild.mjs` (lengkapi standalone + bundel skrip).

## Konvensi

- Nama kode dan teks UI berbahasa Indonesia; pesan commit Bahasa Indonesia.
- Setiap Server Action memvalidasi input dengan Zod dan memeriksa sesi/peran sendiri (jangan andalkan layout/proxy).
- Endpoint HTTP Better Auth sengaja tidak dipasang; login/daftar/keluar lewat `src/actions/auth.ts`.
- Semua halaman dinamis (`connection()` di root layout) karena CSP memakai nonce per request.
- Subquery berkorelasi di Drizzle ditulis dengan nama tabel eksplisit (Drizzle tidak menyertakan nama tabel pada select satu tabel).
- Akses file dengan path dinamis diberi `/*turbopackIgnore: true*/` agar folder proyek tidak ikut ter-trace ke build standalone.
- Jangan commit secret; hook gitleaks aktif.
- Tidak boleh ada alamat situs (domain staging atau IP server) di kode, konten, atau file deploy; alamat hanya dari `domain.env` (runtime: env `SITE_URL`, `PORTOFOLIO_URL`). Folder `docs/` (hasil uji) dikecualikan.
- Animasi: hanya transform/opacity, dibungkus `@media (prefers-reduced-motion: no-preference)` di `globals.css`; konten tidak boleh menunggu JavaScript untuk tampil. Uji di `tests/e2e/gerak.spec.ts`.
- `word-spacing: 0.1em` di body (spasi Plus Jakarta Sans sempit) dan diwariskan ke elemen form.
- Mode tunnel (Tailscale Funnel → Caddy 127.0.0.1:80 → app 127.0.0.1:3003): IP pengunjung dari `ipKlien()` (X-Forwarded-For dari kanan, lewati loopback); jangan pakai header `Tailscale-User-*`. Uji: `npm run uji-rate-limit`, `npm run test:e2e:publik`.
- Hook pre-commit/pre-push menolak IP VPS dan alamat staging; laporan uji yang memuat alamat staging disamarkan dulu dengan `samarkan-staging`. Jangan push (agen utama yang mempublikasikan).

#!/usr/bin/env bash
# Deploy Lumbung Kabut (toko-online-umkm) ke server ini. Jalankan sebagai root dari folder proyek:
#   npm run deploy            # build + pasang
#   npm run deploy -- --tanpa-build
#
# Alamat situs HANYA dibaca dari domain.env (TOKO_URL, PORTOFOLIO_URL). Untuk pindah domain:
# ubah domain.env, jalankan ulang skrip ini (file Caddy dibuat ulang dan Caddy di-reload).
set -euo pipefail
cd "$(dirname "$0")/.."

NAMA=toko-online-umkm
LAYANAN=web-toko-online-umkm
TUJUAN=/srv/web/$NAMA
ENV_FILE=/etc/$LAYANAN/env
RAHASIA=/root/tenma-ws/portofolio/rahasia/$NAMA.txt
DOMAIN_ENV=${DOMAIN_ENV:-/root/tenma-ws/portofolio/domain.env}

[[ $EUID -eq 0 ]] || { echo "Jalankan sebagai root." >&2; exit 1; }

# 0. Alamat situs dari domain.env.
[[ -f $DOMAIN_ENV ]] || { echo "domain.env tidak ditemukan: $DOMAIN_ENV" >&2; exit 1; }
baca_domain() { sed -n "s/^$1=//p" "$DOMAIN_ENV" | tail -1 | tr -d '"'"'"' \r'; }
TOKO_URL=$(baca_domain TOKO_URL)
PORTOFOLIO_URL=$(baca_domain PORTOFOLIO_URL)
TOKO_URL=${TOKO_URL%/}
[[ $TOKO_URL =~ ^https://([a-z0-9.-]+)$ ]] || { echo "TOKO_URL harus berbentuk https://nama-host (tanpa path): '$TOKO_URL'" >&2; exit 1; }
TOKO_HOST=${BASH_REMATCH[1]}
echo "[deploy] TOKO_URL=$TOKO_URL"

# 1. File environment layanan: alamat dari domain.env, secret dibuat sekali lalu dipertahankan.
install -d -m 700 "$(dirname "$ENV_FILE")"
SECRET=$(sed -n 's/^BETTER_AUTH_SECRET=//p' "$ENV_FILE" 2>/dev/null || true)
[[ -n $SECRET ]] || SECRET=$(openssl rand -base64 48 | tr -d '\n')
umask 077
printf 'SITE_URL=%s\nPORTOFOLIO_URL=%s\nBETTER_AUTH_SECRET=%s\n' "$TOKO_URL" "$PORTOFOLIO_URL" "$SECRET" > "$ENV_FILE"
umask 022

# 2. Kredensial admin asli (sekali saja), disimpan di luar repo dengan chmod 600.
if [[ ! -f $RAHASIA ]]; then
  install -d -m 700 "$(dirname "$RAHASIA")"
  ( umask 077; cat > "$RAHASIA" <<KRED
# Kredensial admin ASLI toko demo Lumbung Kabut ($NAMA). Jangan dibagikan.
# Layanan membaca file ini saat start (systemd LoadCredential); ganti Password lalu
# jalankan: systemctl restart $LAYANAN
Halaman masuk: /masuk di TOKO_URL (lihat domain.env)
Email: pemilik@lumbung-kabut.test
Password: $(openssl rand -base64 24 | tr -d '\n/+=' | cut -c1-24)
Nama: Pemilik Lumbung Kabut
KRED
  )
  echo "[deploy] dibuat $RAHASIA"
fi

# 3. Build standalone (URL dari domain.env ikut diberikan ke proses build).
if [[ ${1:-} != "--tanpa-build" ]]; then
  SITE_URL=$TOKO_URL PORTOFOLIO_URL=$PORTOFOLIO_URL NEXT_TELEMETRY_DISABLED=1 npm run build
fi
[[ -f .next/standalone/server.js ]] || { echo "Build standalone tidak ditemukan." >&2; exit 1; }

# 4. Salin hasil build (milik root, hanya-baca untuk layanan).
install -d -m 755 "$TUJUAN"
rsync -a --delete .next/standalone/ "$TUJUAN/"
chown -R root:root "$TUJUAN"
chmod -R u=rwX,go=rX "$TUJUAN"

# 5. Unit systemd.
install -m 644 deploy/$LAYANAN.service deploy/$LAYANAN-reset.service deploy/$LAYANAN-reset.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now $LAYANAN-reset.timer
systemctl enable $LAYANAN.service
systemctl restart $LAYANAN.service

# 6. Caddy: render template dengan host dari domain.env, pasang file situs ini saja,
#    dan pulihkan file lama kalau konfigurasi gabungan tidak valid.
CADDY_BARU=$(mktemp)
sed "s/__TOKO_HOST__/$TOKO_HOST/" deploy/$NAMA.caddy.template > "$CADDY_BARU"
grep -q "__TOKO_HOST__" "$CADDY_BARU" && { echo "Template Caddy belum terisi." >&2; exit 1; }
CADANGAN=$(mktemp)
cp /etc/caddy/sites/$NAMA.caddy "$CADANGAN" 2>/dev/null || true
install -m 644 "$CADDY_BARU" /etc/caddy/sites/$NAMA.caddy
rm -f "$CADDY_BARU"
if ! caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
  [[ -s $CADANGAN ]] && install -m 644 "$CADANGAN" /etc/caddy/sites/$NAMA.caddy
  rm -f "$CADANGAN"
  echo "[deploy] konfigurasi Caddy tidak valid; file lama dipulihkan." >&2
  exit 1
fi
rm -f "$CADANGAN"
systemctl reload caddy

# 7. Tunggu layanan siap.
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3003/ 2>/dev/null; then
    echo "[deploy] layanan siap: $TOKO_URL"
    exit 0
  fi
  sleep 1
done
echo "[deploy] layanan belum merespons; cek: journalctl -u $LAYANAN -n 50" >&2
exit 1

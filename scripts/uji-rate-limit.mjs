/**
 * Uji rate limit login per pengunjung di balik proxy (mode tunnel).
 * Permintaan dikirim dari server ke http://127.0.0.1:80 (Caddy) dengan header Host situs dan
 * X-Forwarded-For berbeda-beda, persis seperti yang dilakukan Tailscale Funnel. Form login dikirim
 * seperti browser tanpa JavaScript (Server Action lewat form POST multipart).
 *
 * Jalankan: npm run uji-rate-limit
 * (Hitungan rate limit disimpan di memori layanan; restart layanan untuk mengosongkannya.)
 */
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import http from "node:http";

const domainEnv = fs.readFileSync(process.env.DOMAIN_ENV ?? "/root/tenma-ws/portofolio/domain.env", "utf8");
const TOKO_URL = domainEnv.match(/^TOKO_URL=(.+)$/m)?.[1]?.trim();
if (!TOKO_URL) throw new Error("TOKO_URL tidak ada di domain.env");
const HOST = new URL(TOKO_URL).host;

function minta(method, path, headers = {}, body) {
  return new Promise((selesai, gagal) => {
    const req = http.request({ host: "127.0.0.1", port: 80, method, path, headers: { Host: HOST, ...headers } }, (res) => {
      const potongan = [];
      res.on("data", (p) => potongan.push(p));
      res.on("end", () => selesai({ status: res.statusCode, body: Buffer.concat(potongan).toString("utf8") }));
    });
    req.on("error", gagal);
    if (body) req.write(body);
    req.end();
  });
}

const dekode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Kirim satu percobaan login gagal sebagai pengunjung dengan X-Forwarded-For tertentu. */
async function cobaMasuk(xff, email) {
  const halaman = await minta("GET", "/masuk", { "X-Forwarded-For": xff });
  const form = halaman.body.match(/<form[^>]*>(?:(?!<\/form>)[\s\S])*name="email"[\s\S]*?<\/form>/)?.[0];
  if (!form) throw new Error(`form login tidak ditemukan (status ${halaman.status})`);
  const isian = [];
  for (const [, nama, nilai] of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/?>/g)) {
    isian.push([nama, dekode(nilai ?? "")]);
  }
  isian.push(["website", ""], ["email", email], ["password", "kata-sandi-salah"]);
  const batas = `----uji${randomBytes(8).toString("hex")}`;
  const body =
    isian.map(([n, v]) => `--${batas}\r\nContent-Disposition: form-data; name="${n}"\r\n\r\n${v}\r\n`).join("") + `--${batas}--\r\n`;
  const res = await minta(
    "POST",
    "/masuk",
    {
      "X-Forwarded-For": xff,
      "X-Forwarded-Proto": "https",
      Origin: TOKO_URL,
      "Content-Type": `multipart/form-data; boundary=${batas}`,
      "Content-Length": Buffer.byteLength(body),
    },
    body,
  );
  if (res.body.includes("Terlalu banyak percobaan masuk")) return "DIBATASI (Terlalu banyak percobaan masuk)";
  if (res.body.includes("Email atau kata sandi salah")) return "diproses (Email atau kata sandi salah)";
  return `lain (HTTP ${res.status})`;
}

const email = `penebak-${Date.now().toString(36)}@contoh.test`;
const A = "203.0.113.10";
const B = "198.51.100.20";
console.log(`Target: http://127.0.0.1:80 (Host: ${HOST}), email uji: ${email}`);
console.log("Batas: 5 percobaan per 15 menit per (IP pengunjung + email), 30 per 15 menit per IP.\n");

// Header persis seperti yang dikirim Funnel ke Caddy; Caddy (proxy tepercaya) menambahkan 127.0.0.1.
const hasil = [];
for (let i = 1; i <= 6; i++) {
  hasil.push({ pengunjung: "A", "X-Forwarded-For": A, percobaan: i, hasil: await cobaMasuk(A, email) });
}
// Pengunjung lain dengan email yang sama punya kuota sendiri.
hasil.push({ pengunjung: "B", "X-Forwarded-For": B, percobaan: 1, hasil: await cobaMasuk(B, email) });
// A mengirim X-Forwarded-For palsu; Funnel menambahkan IP aslinya di kanan. Tetap dikenali sebagai A.
const palsu = `192.0.2.99, ${A}`;
hasil.push({ pengunjung: "A (memalsukan XFF)", "X-Forwarded-For": palsu, percobaan: 7, hasil: await cobaMasuk(palsu, email) });
console.table(hasil);

const ok =
  hasil.slice(0, 5).every((h) => h.hasil.startsWith("diproses")) &&
  hasil[5].hasil.startsWith("DIBATASI") &&
  hasil[6].hasil.startsWith("diproses") &&
  hasil[7].hasil.startsWith("DIBATASI");
console.log(ok ? "\nLULUS: kuota per pengunjung terpisah, pengunjung yang sama tetap kena batas." : "\nGAGAL: perilaku rate limit tidak sesuai.");
process.exit(ok ? 0 : 1);

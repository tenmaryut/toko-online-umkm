/**
 * Bukti deteksi skema https di balik proxy: dijalankan terhadap TOKO_URL publik (domain.env).
 * Memeriksa redirect, atribut cookie sesi setelah login (form tanpa JavaScript), URL absolut,
 * dan tidak adanya sumber http:// di HTML. Jalankan: node scripts/cek-https.mjs
 */
import fs from "node:fs";

const domainEnv = fs.readFileSync(process.env.DOMAIN_ENV ?? "/root/tenma-ws/portofolio/domain.env", "utf8");
const TOKO_URL = domainEnv.match(/^TOKO_URL=(.+)$/m)?.[1]?.trim().replace(/\/+$/, "");
if (!TOKO_URL?.startsWith("https://")) throw new Error("TOKO_URL harus https");
const hasil = [];
const catat = (cek, nilai, lulus) => hasil.push({ cek, nilai: String(nilai).slice(0, 110), lulus: lulus ? "ya" : "TIDAK" });

// 1. Redirect area terlindungi: Location relatif, jadi tetap di origin https publik.
const r1 = await fetch(`${TOKO_URL}/akun`, { redirect: "manual" });
const lokasi = r1.headers.get("location") ?? "";
catat("GET /akun tanpa sesi → redirect", `${r1.status} Location: ${lokasi}`, r1.status === 307 && lokasi.startsWith("/masuk"));

// 2. Login akun demo pelanggan lewat form tanpa JavaScript, lalu baca atribut Set-Cookie.
const halaman = await (await fetch(`${TOKO_URL}/masuk`)).text();
const form = halaman.match(/<form[^>]*>(?:(?!<\/form>)[\s\S])*name="email"[\s\S]*?<\/form>/)?.[0] ?? "";
const data = new FormData();
for (const [, nama, nilai] of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\/?>/g)) {
  data.append(nama, (nilai ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
}
data.append("website", "");
data.append("email", "demo@lumbung-kabut.test");
data.append("password", "pelanggan123");
const r2 = await fetch(`${TOKO_URL}/masuk`, { method: "POST", body: data, redirect: "manual", headers: { Origin: TOKO_URL } });
const cookieSesi = r2.headers.getSetCookie().find((c) => c.includes("lk.session_token")) ?? "";
const atribut = cookieSesi.split(";").slice(1).map((s) => s.trim()).join("; ");
catat("Login demo → cookie sesi", `${cookieSesi.split("=")[0]}; ${atribut}`, /^__Secure-lk\.session_token$/.test(cookieSesi.split("=")[0]) && /;\s*Secure/i.test(cookieSesi) && /HttpOnly/i.test(cookieSesi) && /SameSite=Lax/i.test(cookieSesi));

// 3. URL absolut memakai https publik.
const sitemap = await (await fetch(`${TOKO_URL}/sitemap.xml`)).text();
const loc = sitemap.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
catat("sitemap.xml <loc> pertama", loc, loc.startsWith(`${TOKO_URL}/`));
const produk = await (await fetch(`${TOKO_URL}/produk/kopi-arabika-lereng-pagi`)).text();
const canonical = produk.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
const ogImage = produk.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
catat("canonical halaman produk", canonical, canonical.startsWith(`${TOKO_URL}/`));
catat("og:image halaman produk", ogImage, ogImage.startsWith(`${TOKO_URL}/`));

// 4. Tanpa mixed content: tidak ada src/href http:// di HTML beranda dan produk.
const rBeranda = await fetch(`${TOKO_URL}/`);
const beranda = await rBeranda.text();
const sumberHttp = [...(beranda + produk).matchAll(/(?:src|href|content)="(http:\/\/[^"]+)"/g)].map((m) => m[1]);
catat("sumber http:// di HTML", sumberHttp.length ? sumberHttp.join(" ") : "tidak ada", sumberHttp.length === 0);
const csp = rBeranda.headers.get("content-security-policy") ?? "";
catat("CSP beranda: upgrade-insecure-requests", csp.includes("upgrade-insecure-requests") ? "ada" : "tidak ada", csp.includes("upgrade-insecure-requests"));
const hsts = rBeranda.headers.get("strict-transport-security") ?? "";
catat("HSTS (dari Caddy)", hsts || "tidak ada", hsts.includes("max-age"));

console.log(`Target: ${TOKO_URL}`);
console.table(hasil);
const ok = hasil.every((h) => h.lulus === "ya");
console.log(ok ? "LULUS: skema https dikenali dengan benar di balik proxy." : "GAGAL");
process.exit(ok ? 0 : 1);

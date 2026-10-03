import fs from "node:fs";
import path from "node:path";
import { type Browser, expect, type Page, test } from "@playwright/test";

/**
 * Bukti responsif: setiap halaman dibuka di 6 lebar layar (360–1440 px), dicek tidak ada
 * scroll horizontal, lalu di-screenshot pada 360, 768, dan 1440 px ke docs/screenshots/.
 */
const LEBAR_CEK = [360, 390, 768, 1024, 1280, 1440];
const LEBAR_SIMPAN = new Set([360, 768, 1440]);
const FOLDER = path.join(process.cwd(), "docs", "screenshots");

type Halaman = { nama: string; path: string | ((p: Page) => Promise<string>); peran?: "pelanggan" | "admin"; siapkan?: (p: Page) => Promise<void> };

async function login(browser: Browser, peran: "pelanggan" | "admin") {
  const konteks = await browser.newContext();
  const page = await konteks.newPage();
  await page.goto("/masuk");
  await page.getByRole("button", { name: `Isi otomatis: ${peran} demo` }).click();
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL(peran === "admin" ? /\/admin$/ : /\/akun$/);
  const state = await konteks.storageState();
  await konteks.close();
  return state;
}

async function isiKeranjang(p: Page) {
  for (const slug of ["kopi-arabika-lereng-pagi", "sambal-bawang-lereng"]) {
    await p.goto(`/produk/${slug}`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Tambah ke keranjang" }).click();
    await p.getByRole("link", { name: "Lihat keranjang" }).waitFor();
  }
}

const HALAMAN: Halaman[] = [
  { nama: "01-beranda", path: "/" },
  { nama: "02-katalog", path: "/produk" },
  { nama: "03-katalog-filter", path: "/produk?q=kopi&urut=harga-terendah&tersedia=1" },
  { nama: "04-kategori", path: "/kategori/camilan" },
  { nama: "05-detail-produk", path: "/produk/kopi-arabika-lereng-pagi" },
  {
    nama: "06-keranjang",
    path: "/keranjang",
    peran: "pelanggan",
    siapkan: isiKeranjang,
  },
  { nama: "07-checkout", path: "/checkout", peran: "pelanggan", siapkan: isiKeranjang },
  { nama: "08-masuk", path: "/masuk" },
  { nama: "09-akun", path: "/akun", peran: "pelanggan" },
  {
    nama: "10-detail-pesanan",
    peran: "pelanggan",
    path: async (p) => {
      await p.goto("/akun/pesanan");
      return (await p.getByTestId("pesanan-saya").first().getAttribute("href")) ?? "/akun/pesanan";
    },
  },
  { nama: "11-admin-ringkasan", path: "/admin", peran: "admin" },
  { nama: "12-admin-pesanan", path: "/admin/pesanan", peran: "admin" },
  {
    nama: "13-admin-detail-pesanan",
    peran: "admin",
    path: async (p) => {
      await p.goto("/admin/pesanan?status=dibayar");
      return (await p.locator('a[href^="/admin/pesanan/LK"]').first().getAttribute("href")) ?? "/admin/pesanan";
    },
  },
  { nama: "14-admin-produk", path: "/admin/produk", peran: "admin" },
  { nama: "15-admin-ubah-produk", path: "/admin/produk/1", peran: "admin" },
  { nama: "16-admin-kategori", path: "/admin/kategori", peran: "admin" },
  { nama: "17-admin-pelanggan", path: "/admin/pelanggan", peran: "admin" },
  { nama: "18-halaman-404", path: "/halaman-yang-tidak-ada" },
];

test.describe.configure({ mode: "serial" });

test("responsif 360–1440 px dan screenshot halaman utama", async ({ browser }) => {
  test.setTimeout(10 * 60_000);
  fs.mkdirSync(FOLDER, { recursive: true });
  const sesi = { pelanggan: await login(browser, "pelanggan"), admin: await login(browser, "admin") };
  const masalah: string[] = [];

  for (const h of HALAMAN) {
    const konteks = await browser.newContext({ storageState: h.peran ? sesi[h.peran] : undefined, viewport: { width: 1440, height: 900 } });
    const page = await konteks.newPage();
    const galatKonsol: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("404")) galatKonsol.push(m.text());
    });
    if (h.siapkan) await h.siapkan(page);
    const url = typeof h.path === "string" ? h.path : await h.path(page);

    for (const lebar of LEBAR_CEK) {
      await page.setViewportSize({ width: lebar, height: lebar < 768 ? 800 : 900 });
      await page.goto(url, { waitUntil: "networkidle" });
      const lebih = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (lebih > 0) masalah.push(`${h.nama} @${lebar}px meluap ${lebih}px`);
      if (LEBAR_SIMPAN.has(lebar)) {
        await page.screenshot({ path: path.join(FOLDER, `${h.nama}-${lebar}.jpg`), fullPage: true, type: "jpeg", quality: 62 });
      }
    }
    if (galatKonsol.length) masalah.push(`${h.nama}: galat konsol ${galatKonsol.join(" | ")}`);
    await konteks.close();
  }

  expect(masalah, masalah.join("\n")).toEqual([]);
});

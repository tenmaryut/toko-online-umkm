import fs from "node:fs";
import path from "node:path";
import { type Browser, type BrowserContext, type Page, test } from "@playwright/test";
import { buka, masukSebagai, tungguPath } from "./bantu";

/**
 * Rekaman WebM pendek untuk animasi utama (putaran 2) → docs/animasi/.
 * Jalankan: npm run build && npm run rekam-animasi
 */
const FOLDER = path.join(process.cwd(), "docs", "animasi");
const SEMENTARA = path.join(process.cwd(), "test-results", "video-sementara");

test.describe.configure({ mode: "serial" });
test.beforeAll(() => fs.mkdirSync(FOLDER, { recursive: true }));

async function rekam(
  browser: Browser,
  nama: string,
  lebar: number,
  tinggi: number,
  jalan: (page: Page, ctx: BrowserContext) => Promise<void>,
) {
  const ctx = await browser.newContext({
    viewport: { width: lebar, height: tinggi },
    reducedMotion: "no-preference",
    recordVideo: { dir: SEMENTARA, size: { width: lebar, height: tinggi } },
  });
  const page = await ctx.newPage();
  await jalan(page, ctx);
  await page.waitForTimeout(600);
  const video = page.video();
  await ctx.close();
  await video?.saveAs(path.join(FOLDER, `${nama}.webm`));
}

/** Perlambat jaringan supaya status memuat (skeleton) cukup lama untuk terlihat di rekaman. */
async function jaringanLambat(page: Page, ctx: BrowserContext) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 1200, downloadThroughput: 400_000, uploadThroughput: 200_000 });
}

test("01 tambah ke keranjang: centang, lencana memantul, keranjang mini", async ({ browser }) => {
  test.setTimeout(90_000);
  await rekam(browser, "01-tambah-keranjang", 1280, 800, async (page) => {
    await buka(page, "/produk");
    await page.waitForTimeout(900);
    const kartu = page.locator("article").nth(1);
    await kartu.hover();
    await page.waitForTimeout(700);
    await kartu.getByRole("button", { name: /^Tambah .* ke keranjang$/ }).click();
    await page.getByTestId("keranjang-mini").waitFor();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(FOLDER, "01-keranjang-mini.png") });
    await page.locator("article").nth(2).getByRole("button", { name: /^Tambah .* ke keranjang$/ }).click();
    await page.waitForTimeout(2500);
  });
});

test("02 keranjang mini di layar kecil", async ({ browser }) => {
  test.setTimeout(90_000);
  await rekam(browser, "02-keranjang-mini-mobile", 390, 844, async (page) => {
    await buka(page, "/produk/sambal-bawang-lereng");
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
    await page.getByTestId("keranjang-mini").waitFor();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(FOLDER, "02-keranjang-mini-mobile.png") });
    await page.waitForTimeout(800);
  });
});

test("03 grid muncul bertahap, skeleton saat filter berubah, gambar membesar saat fokus", async ({ browser }) => {
  test.setTimeout(120_000);
  await rekam(browser, "03-grid-filter-skeleton", 1280, 800, async (page, ctx) => {
    await buka(page, "/produk");
    await page.waitForTimeout(1200);
    await jaringanLambat(page, ctx);
    await page.getByRole("radio", { name: /Camilan/ }).check();
    await page.getByTestId("kerangka-katalog").waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(FOLDER, "03-skeleton-katalog.png") });
    await page.getByTestId("kerangka-katalog").waitFor({ state: "detached", timeout: 30_000 });
    await page.waitForTimeout(1200);
    await page.getByLabel("Urutkan").selectOption("harga-terendah");
    await page.getByTestId("kerangka-katalog").waitFor();
    await page.getByTestId("kerangka-katalog").waitFor({ state: "detached", timeout: 30_000 });
    await page.waitForTimeout(1000);
    // Fokus keyboard pada tautan produk membesarkan gambarnya sedikit.
    await page.locator("article h3 a").first().focus();
    await page.waitForTimeout(900);
  });
});

test("04 toast dan perubahan status pesanan oleh admin", async ({ browser }) => {
  test.setTimeout(90_000);
  await rekam(browser, "04-toast-admin", 1280, 800, async (page) => {
    await buka(page, "/masuk?kembali=/admin/kategori");
    await masukSebagai(page, "admin demo");
    await tungguPath(page, "/admin/kategori");
    await page.locator("#kat-baru-name").fill("Bingkisan Lebaran");
    await page.getByRole("button", { name: "Tambah kategori" }).click();
    await page.getByTestId("toast").first().waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(FOLDER, "04-toast.png") });
    await page.waitForTimeout(1200);
    await buka(page, "/admin/pesanan?status=dibayar");
    await page.locator('a[href^="/admin/pesanan/LK"]').first().click();
    await tungguPath(page, /^\/admin\/pesanan\/LK/);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Tandai dikemas" }).click();
    await page.getByTestId("toast").first().waitFor();
    await page.waitForTimeout(2200);
  });
});

test("05 langkah checkout dan linimasa pesanan", async ({ browser }) => {
  test.setTimeout(120_000);
  await rekam(browser, "05-checkout-linimasa", 1280, 800, async (page) => {
    await buka(page, "/produk/kopi-arabika-lereng-pagi");
    await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
    await page.getByTestId("keranjang-mini").waitFor();
    await buka(page, "/masuk?kembali=/checkout");
    await masukSebagai(page, "pelanggan demo");
    await tungguPath(page, "/checkout");
    await page.waitForTimeout(800);
    await page.getByLabel("Kode pos").fill("");
    await page.waitForTimeout(900);
    await page.getByLabel("Provinsi", { exact: true }).selectOption("");
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(FOLDER, "05-langkah-checkout.png") });
    await page.getByLabel("Provinsi", { exact: true }).selectOption("Bali");
    await page.waitForTimeout(800);
    await page.getByLabel("Kode pos").pressSequentially("80111", { delay: 80 });
    await page.waitForTimeout(900);
    await page.getByRole("radio", { name: /Kilat/ }).check();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Buat pesanan" }).click();
    await tungguPath(page, /^\/akun\/pesanan\/LK/);
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Bayar sekarang (simulasi)" }).click();
    await page.locator('h1 + [data-status="dibayar"]').waitFor();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(FOLDER, "05-linimasa-pesanan.png") });
    await page.waitForTimeout(1000);
  });
});

test("06 dasbor admin: grafik tergambar bertahap dan angka menghitung naik", async ({ browser }) => {
  test.setTimeout(90_000);
  await rekam(browser, "06-dasbor-admin", 1280, 800, async (page) => {
    await buka(page, "/masuk?kembali=/admin");
    await masukSebagai(page, "admin demo");
    await tungguPath(page, "/admin");
    await page.waitForTimeout(700);
    await page.reload();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(FOLDER, "06-dasbor-sedang-animasi.png") });
    await page.waitForTimeout(2000);
  });
});

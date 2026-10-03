import { expect, test } from "@playwright/test";
import { buka, masukSebagai, RUN, tungguPath } from "./bantu";

test("area admin dijaga di server: pelanggan mendapat 404", async ({ page }) => {
  await buka(page, "/masuk?kembali=/akun");
  await masukSebagai(page, "pelanggan demo");
  await tungguPath(page, "/akun");
  await expect(page.getByRole("heading", { name: "Halo, Pelanggan Demo" })).toBeVisible();
  const respons = await page.goto("/admin");
  expect(respons?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Halaman ini hilang di balik kabut" })).toBeVisible();
});

test("rate limit login setelah 5 percobaan gagal", async ({ page }) => {
  await buka(page, "/masuk");
  const coba = async (i: number) => {
    await page.getByLabel("Email").fill(`penebak-${RUN}@contoh.test`);
    await page.getByLabel("Kata sandi").fill(`salah-${i}`);
    // Tunggu respons Server Action tiap percobaan supaya urutannya pasti.
    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/masuk")),
      page.getByRole("button", { name: "Masuk", exact: true }).click(),
    ]);
  };
  for (let i = 1; i <= 5; i++) {
    await coba(i);
    await expect(page.getByRole("alert").filter({ hasText: "Email atau kata sandi salah." })).toBeVisible();
  }
  await coba(6);
  await expect(page.getByRole("alert").filter({ hasText: "Terlalu banyak percobaan masuk" })).toBeVisible();
});

test("validasi server dan honeypot pada pendaftaran", async ({ page }) => {
  await buka(page, "/daftar");
  await page.getByRole("button", { name: "Buat akun" }).click();
  await expect(page.getByText("Nama minimal 2 karakter")).toBeVisible();
  await expect(page.getByText("Format email tidak valid")).toBeVisible();

  // Bot yang mengisi kolom jebakan ditolak tanpa membuat akun.
  await page.getByLabel("Nama").fill("Bot Spam");
  await page.getByLabel("Email").fill("bot@contoh.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("rahasia1234");
  await page.getByLabel("Ulangi kata sandi").fill("rahasia1234");
  await page.getByRole("checkbox").check();
  await page.locator("#kolom-website").fill("http://spam.example", { force: true });
  await page.getByRole("button", { name: "Buat akun" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Permintaan tidak dapat diproses." })).toBeVisible();
});

test("header keamanan: CSP dengan nonce dan tanpa X-Powered-By", async ({ request }) => {
  const respons = await request.get("/");
  const csp = respons.headers()["content-security-policy"] ?? "";
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  expect(csp).toContain("frame-ancestors 'none'");
  expect(respons.headers()["x-powered-by"]).toBeUndefined();
});

test("SEO: sitemap, robots, meta produk, dan data terstruktur Product", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/produk/kopi-arabika-lereng-pagi");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap:");

  await page.goto("/produk/sambal-bawang-lereng");
  await expect(page).toHaveTitle("Sambal Bawang Lereng 190 ml · Lumbung Kabut");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/produk\/sambal-bawang-lereng$/);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  const produk = jsonLd.map((t) => JSON.parse(t)).find((d) => d["@type"] === "Product");
  expect(produk).toMatchObject({
    name: "Sambal Bawang Lereng 190 ml",
    offers: { "@type": "Offer", priceCurrency: "IDR", price: 35000 },
  });
  const og = await request.get("/og/produk/sambal-bawang-lereng");
  expect(og.headers()["content-type"]).toBe("image/png");
});

test("halaman 404 khusus", async ({ page }) => {
  const respons = await page.goto("/produk/tidak-ada-produk-ini");
  expect(respons?.status()).toBe(404);
  await expect(page.getByText("Galat 404")).toBeVisible();
});

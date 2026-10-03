import { expect, test } from "@playwright/test";
import { buka, masukSebagai, tungguPath } from "./bantu";

/**
 * Di balik proxy (Tailscale Funnel → Caddy → aplikasi): skema https dikenali dengan benar.
 * Terhadap URL publik (https) cookie wajib Secure; terhadap server uji lokal (http) tidak.
 */
test("skema https: cookie Secure, URL absolut, redirect, dan tanpa mixed content", async ({ page, baseURL }) => {
  const asal = new URL(baseURL!).origin;
  const https = asal.startsWith("https://");
  const permintaanHttp: string[] = [];
  const peringatan: string[] = [];
  page.on("request", (r) => {
    if (https && r.url().startsWith("http://")) permintaanHttp.push(r.url());
  });
  page.on("console", (m) => {
    if (/mixed content|insecure/i.test(m.text())) peringatan.push(m.text());
  });

  // Redirect area terlindungi tetap di origin publik yang sama.
  await buka(page, "/akun");
  expect(new URL(page.url()).origin).toBe(asal);
  expect(new URL(page.url()).pathname).toBe("/masuk");

  // Cookie sesi setelah login.
  await masukSebagai(page, "pelanggan demo");
  await tungguPath(page, "/akun");
  expect(new URL(page.url()).origin).toBe(asal);
  const sesi = (await page.context().cookies()).find((c) => c.name.endsWith("lk.session_token"));
  expect(sesi, "cookie sesi ada").toBeTruthy();
  expect(sesi!.secure).toBe(https);
  expect(sesi!.httpOnly).toBe(true);
  expect(sesi!.sameSite).toBe("Lax");
  if (https) expect(sesi!.name.startsWith("__Secure-")).toBe(true);

  // Cookie keranjang.
  await buka(page, "/produk/teh-serai-jahe");
  await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
  await expect(page.getByTestId("keranjang-mini")).toBeVisible();
  const keranjang = (await page.context().cookies()).find((c) => c.name === "lk_keranjang");
  expect(keranjang, "cookie keranjang ada").toBeTruthy();
  expect(keranjang!.secure).toBe(https);
  expect(keranjang!.httpOnly).toBe(true);

  // URL absolut (canonical, Open Graph, data terstruktur) memakai origin publik.
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
  const produk = jsonLd.find((d) => d["@type"] === "Product");
  for (const url of [canonical, ogUrl, ogImage, produk.url, produk.offers.url, ...produk.image]) {
    expect(url, `URL absolut: ${url}`).toMatch(new RegExp(`^${asal.replace(/[.]/g, "\\.")}/`));
  }
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${asal}/sitemap.xml`);

  expect(permintaanHttp, "tidak ada permintaan http:// dari halaman https").toEqual([]);
  expect(peringatan, "tidak ada peringatan mixed content").toEqual([]);
});

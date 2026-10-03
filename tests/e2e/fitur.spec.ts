import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { buka, masukSebagai, RUN, tungguPath } from "./bantu";

test("pelanggan baru bisa mendaftar dan langsung masuk", async ({ page }) => {
  await buka(page, "/daftar");
  const email = `uji-${Date.now()}@contoh.test`;
  await page.getByLabel("Nama").fill("Pengunjung Uji");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill("rahasia1234");
  await page.getByLabel("Ulangi kata sandi").fill("rahasia1234");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Buat akun" }).click();
  await tungguPath(page, "/akun");
  await expect(page.getByRole("heading", { name: "Halo, Pengunjung Uji" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("Pelanggan", { exact: true })).toBeVisible();
});

test("admin menambah kategori dan produk dengan unggah gambar", async ({ page }) => {
  await buka(page, "/masuk");
  await masukSebagai(page, "admin demo");
  await tungguPath(page, "/admin");

  // Kategori baru
  await buka(page, "/admin/kategori");
  const kategori = `Oleh-oleh Uji ${RUN}`;
  const produk = `Gula Semut Uji ${RUN} 250 g`;
  const slugProduk = `gula-semut-uji-${RUN}-250-g`;
  await page.locator("#kat-baru-name").fill(kategori);
  await page.getByRole("button", { name: "Tambah kategori" }).click();
  await expect(page.getByText("Kategori ditambahkan.").first()).toBeVisible();
  await expect(page.getByText(`/oleh-oleh-uji-${RUN}`)).toBeVisible();

  // Produk baru dengan gambar PNG 640×480 (akan dipotong persegi dan dikonversi ke WebP)
  const gambar = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#c98b4b" } }).png().toBuffer();
  await buka(page, "/admin/produk/baru");
  await page.getByLabel("Nama produk").fill(produk);
  await page.getByLabel("Kategori").selectOption({ label: kategori });
  await page.getByLabel("Harga (Rp)").fill("Rp 27.500");
  await page.getByLabel("Stok").fill("9");
  await page.getByLabel("Deskripsi").fill("Produk uji yang dibuat oleh test e2e lewat dasbor admin.");
  await page.setInputFiles("#kolom-gambar", { name: "gula.png", mimeType: "image/png", buffer: gambar });
  await page.getByRole("button", { name: "Tambah produk" }).click();
  await tungguPath(page, "/admin/produk");
  await expect(page.getByText("Produk ditambahkan.").first()).toBeVisible();

  // Tampil di toko dengan gambar unggahan yang disajikan dari luar folder build
  await buka(page, `/produk/${slugProduk}`);
  await expect(page.getByRole("heading", { level: 1, name: produk })).toBeVisible();
  await expect(page.getByTestId("harga-produk")).toHaveText("Rp 27.500");
  const src = await page.getByRole("img", { name: `Ilustrasi kemasan ${produk}` }).getAttribute("src");
  expect(src).toMatch(/^\/uploads\/[0-9a-f-]{36}\.webp$/);
  const respons = await page.request.get(src!);
  expect(respons.headers()["content-type"]).toBe("image/webp");
  const meta = await sharp(await respons.body()).metadata();
  expect([meta.format, meta.width, meta.height]).toEqual(["webp", 480, 480]);
});

test("unggahan bukan gambar ditolak", async ({ page }) => {
  await buka(page, "/masuk");
  await masukSebagai(page, "admin demo");
  await tungguPath(page, "/admin");
  await buka(page, "/admin/produk/baru");
  await page.getByLabel("Nama produk").fill("Produk Gambar Palsu");
  await page.getByLabel("Kategori").selectOption({ label: "Kopi" });
  await page.getByLabel("Harga (Rp)").fill("10000");
  await page.getByLabel("Stok").fill("1");
  await page.getByLabel("Deskripsi").fill("Mencoba mengunggah file teks yang menyamar sebagai PNG.");
  await page.setInputFiles("#kolom-gambar", { name: "palsu.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") });
  await page.getByRole("button", { name: "Tambah produk" }).click();
  await expect(page.getByText("Gambar tidak bisa dibaca. Coba file lain.")).toBeVisible();
});

test("halaman 500 khusus", async ({ page }) => {
  const respons = await page.goto("/uji-galat");
  expect(respons?.status()).toBe(500);
  await expect(page.getByRole("heading", { name: "Ada yang macet di lumbung" })).toBeVisible();
  await expect(page.getByText("Galat 500")).toBeVisible();
});

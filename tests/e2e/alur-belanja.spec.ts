import { expect, test } from "@playwright/test";
import { buka, masukSebagai, tungguPath } from "./bantu";

/**
 * Alur utama: jelajah → keranjang → checkout sebagai pelanggan demo → bayar (simulasi)
 * → admin demo mengubah status pesanan sampai selesai → pelanggan melihat status terbaru.
 */
test.describe.configure({ mode: "serial" });

const PRODUK = "Kopi Arabika Lereng Pagi 200 g";
let kodePesanan = "";
let stokAwal = 0;

test("pelanggan: jelajah, isi keranjang, checkout, dan bayar simulasi", async ({ page }) => {
  // Jelajah dari beranda ke katalog, lalu cari produk.
  await buka(page, "/");
  await expect(page.getByText("Toko demo portofolio. Tidak ada transaksi nyata.").first()).toBeVisible();
  await page.getByRole("link", { name: "Jelajahi katalog" }).click();
  await tungguPath(page, "/produk");
  const utama = page.getByRole("main");
  await utama.getByLabel("Cari produk", { exact: true }).fill("arabika");
  await utama.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page).toHaveURL(/q=arabika/);
  await page.getByRole("link", { name: PRODUK }).click();
  await tungguPath(page, "/produk/kopi-arabika-lereng-pagi");

  // Detail produk: harga Rupiah, stok, tambah 2 ke keranjang.
  await expect(page.getByRole("heading", { level: 1, name: PRODUK })).toBeVisible();
  await expect(page.getByTestId("harga-produk")).toHaveText("Rp 78.000");
  stokAwal = Number(await page.getByTestId("stok-produk").textContent());
  await page.getByRole("button", { name: "Tambah jumlah" }).click();
  await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
  await expect(page.getByText(`${PRODUK} ditambahkan`)).toBeVisible();
  await expect(page.getByTestId("jumlah-keranjang")).toContainText("2");

  // Keranjang bertahan setelah reload.
  await buka(page, "/keranjang");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("baris-keranjang")).toHaveCount(1);
  await expect(page.getByTestId("jumlah-baris")).toHaveText("2");
  await expect(page.getByTestId("subtotal-keranjang")).toHaveText("Rp 156.000");

  // Checkout butuh login → masuk sebagai pelanggan demo → kembali ke checkout.
  await page.getByRole("link", { name: "Lanjut ke checkout" }).click();
  await tungguPath(page, "/masuk");
  expect(new URL(page.url()).searchParams.get("kembali")).toBe("/checkout");
  await masukSebagai(page, "pelanggan demo");
  await tungguPath(page, "/checkout");

  await page.getByLabel("Nama penerima").fill("Pelanggan Demo");
  await page.getByLabel("Nomor HP").fill("081234567890");
  await page.getByLabel("Alamat lengkap").fill("Jl. Contoh Demo No. 1, RT 01/RW 02");
  await page.getByLabel("Kota/kabupaten").fill("Kota Contoh");
  await page.getByLabel("Provinsi").selectOption("Jawa Tengah");
  await page.getByLabel("Kode pos").fill("50111");
  await page.getByRole("radio", { name: /Kilat/ }).check();
  // Ongkir tetap Zona 1 (Jawa), layanan Kilat.
  await expect(page.getByTestId("ongkir-checkout")).toHaveText("Rp 22.000");
  await expect(page.getByTestId("total-checkout")).toHaveText("Rp 178.000");
  await page.getByRole("radio", { name: "QRIS (simulasi)" }).check();
  await page.getByRole("button", { name: "Buat pesanan" }).click();

  // Pesanan dibuat, keranjang dikosongkan, lalu bayar simulasi.
  await tungguPath(page, /^\/akun\/pesanan\/LK\d{6}-[A-Z0-9]{4}$/);
  kodePesanan = (await page.getByTestId("kode-pesanan").textContent())!.trim();
  await expect(page.locator("h1 + [data-status]")).toHaveAttribute("data-status", "menunggu_pembayaran");
  await expect(page.getByTestId("total-pesanan")).toHaveText("Rp 178.000");
  await expect(page.getByTestId("jumlah-keranjang")).toContainText("0");
  await page.getByRole("button", { name: "Bayar sekarang (simulasi)" }).click();
  await expect(page.locator("h1 + [data-status]")).toHaveAttribute("data-status", "dibayar");

  // Stok berkurang saat pesanan dibuat.
  await buka(page, "/produk/kopi-arabika-lereng-pagi");
  await expect(page.getByTestId("stok-produk")).toHaveText(String(stokAwal - 2));
});

test("admin: mengubah status pesanan dibayar → dikemas → dikirim → selesai", async ({ page }) => {
  expect(kodePesanan).not.toBe("");
  await buka(page, "/admin");
  await tungguPath(page, "/masuk");
  expect(new URL(page.url()).searchParams.get("kembali")).toBe("/admin");
  await masukSebagai(page, "admin demo");
  await tungguPath(page, "/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Ringkasan" })).toBeVisible();
  await expect(page.getByText("Pendapatan harian, 14 hari terakhir")).toBeVisible();

  await page.getByRole("navigation", { name: "Menu admin" }).getByRole("link", { name: /Pesanan/ }).click();
  await tungguPath(page, "/admin/pesanan");
  await page.getByLabel("Cari kode pesanan").fill(kodePesanan);
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await page.getByRole("link", { name: kodePesanan }).first().click();
  await tungguPath(page, `/admin/pesanan/${kodePesanan}`);
  const status = page.locator("h1 + [data-status]");
  await expect(status).toHaveAttribute("data-status", "dibayar");

  for (const [tombol, hasil] of [
    ["Tandai dikemas", "dikemas"],
    ["Tandai dikirim", "dikirim"],
    ["Tandai selesai", "selesai"],
  ] as const) {
    await page.getByRole("button", { name: tombol }).click();
    await expect(status).toHaveAttribute("data-status", hasil);
  }
  await expect(page.getByText("tidak ada langkah berikutnya")).toBeVisible();
});

test("pelanggan melihat status pesanan terbaru di akunnya", async ({ page }) => {
  await buka(page, `/akun/pesanan/${kodePesanan}`);
  await tungguPath(page, "/masuk");
  await masukSebagai(page, "pelanggan demo");
  await tungguPath(page, `/akun/pesanan/${kodePesanan}`);
  await expect(page.locator("h1 + [data-status]")).toHaveAttribute("data-status", "selesai");
  await buka(page, "/akun");
  await expect(page.getByTestId("pesanan-saya").filter({ hasText: kodePesanan })).toContainText("Selesai");
});

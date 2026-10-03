import { type Browser, expect, type Page, test } from "@playwright/test";
import { buka, masukSebagai, RUN, tungguPath } from "./bantu";

/**
 * Animasi putaran 2: aktif secara normal, dan dimatikan oleh prefers-reduced-motion: reduce.
 * Diperiksa lewat nama animasi terhitung (getComputedStyle) pada elemen yang dianimasikan.
 */

const animasi = (page: Page, selektor: string, pseudo?: string) =>
  page.locator(selektor).first().evaluate((el, p) => getComputedStyle(el, p ?? null).animationName, pseudo);

/** Membuat elemen uji untuk kelas yang hanya muncul sesaat (skeleton, denyut), lalu membaca animasinya. */
const animasiKelas = (page: Page, kelas: string, pseudo?: string) =>
  page.evaluate(
    ([k, p]) => {
      const el = document.createElement("div");
      el.className = k!;
      document.body.append(el);
      const nama = getComputedStyle(el, p || null).animationName;
      el.remove();
      return nama;
    },
    [kelas, pseudo ?? ""],
  );

async function konteks(browser: Browser, reduced: boolean) {
  const ctx = await browser.newContext({ reducedMotion: reduced ? "reduce" : "no-preference", viewport: { width: 1280, height: 900 } });
  // Catat setiap nilai yang pernah tampil di angka ringkasan dasbor, sejak dokumen mulai dimuat.
  await ctx.addInitScript(() => {
    const w = window as unknown as { __angka: string[] };
    w.__angka = [];
    new MutationObserver(() => {
      const el = document.querySelector('[data-testid="angka-naik"]');
      const teks = el?.textContent ?? "";
      if (teks && w.__angka.at(-1) !== teks) w.__angka.push(teks);
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
  return ctx;
}

for (const reduced of [false, true]) {
  test(`animasi ${reduced ? "MATI dengan" : "aktif tanpa"} prefers-reduced-motion: reduce`, async ({ browser }) => {
    const ctx = await konteks(browser, reduced);
    const page = await ctx.newPage();
    const harap = (nama: string) => (reduced ? "none" : nama);

    // Grid produk muncul bertahap.
    await buka(page, "/produk");
    expect(await animasi(page, ".muncul-bertahap > li")).toBe(harap("lk-muncul"));
    // Skeleton berkilau dan denyut linimasa (diuji lewat kelasnya).
    expect(await animasiKelas(page, "kerangka", "::after")).toBe(harap("lk-kilau"));
    expect(await animasiKelas(page, "denyut", "::before")).toBe(harap("lk-denyut"));

    // Tambah ke keranjang: centang, lencana memantul, keranjang mini meluncur masuk.
    await page.getByRole("button", { name: /^Tambah .* ke keranjang$/ }).first().click();
    const mini = page.getByTestId("keranjang-mini");
    await expect(mini).toBeVisible();
    expect(await animasi(page, '[data-testid="keranjang-mini"]')).toBe(harap("lk-geser-kanan"));
    expect(await animasi(page, '[data-testid="jumlah-keranjang"]')).toBe(harap("lk-pantul"));
    expect(await animasi(page, '[data-status="ditambahkan"] .centang-masuk')).toBe(harap("lk-centang"));
    // Animasi tidak menghalangi fokus/interaksi: tombol di keranjang mini bisa difokus dan dipakai.
    await mini.getByRole("link", { name: "Keranjang" }).focus();
    await expect(mini.getByRole("link", { name: "Keranjang" })).toBeFocused();

    // Dasbor admin: kolom grafik tumbuh dan angka ringkasan menghitung naik dari data asli.
    await buka(page, "/masuk?kembali=/admin");
    await masukSebagai(page, "admin demo");
    await tungguPath(page, "/admin");
    expect(await animasi(page, '[data-testid="batang-grafik"]')).toBe(harap("lk-tumbuh-y"));
    const angka = page.getByTestId("angka-naik").first();
    const formatAkhir = await page.evaluate(
      (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n)),
      await angka.getAttribute("data-nilai"),
    );
    await expect(angka).toHaveText(formatAkhir);
    const riwayat = await page.evaluate(() => (window as unknown as { __angka: string[] }).__angka);
    if (reduced) {
      expect(new Set(riwayat)).toEqual(new Set([formatAkhir])); // langsung nilai asli
    } else {
      expect(riwayat.length).toBeGreaterThan(5); // nilai antara selama menghitung naik
      expect(riwayat.at(-1)).toBe(formatAkhir);
    }

    // Toast meluncur masuk setelah menyimpan kategori.
    await buka(page, "/admin/kategori");
    await page.locator("#kat-baru-name").fill(`Uji Gerak ${reduced ? "R" : "N"} ${RUN}`);
    await page.getByRole("button", { name: "Tambah kategori" }).click();
    const toast = page.getByTestId("toast").first();
    await expect(toast).toBeVisible();
    expect(await animasi(page, '[data-testid="toast"]')).toBe(harap("lk-toast"));

    // Linimasa pesanan.
    await buka(page, "/admin/pesanan?status=dikirim");
    await page.locator('a[href^="/admin/pesanan/LK"]').first().click();
    await tungguPath(page, /^\/admin\/pesanan\/LK/);
    expect(await animasi(page, '[data-testid="linimasa"] .titik-muncul')).toBe(harap("lk-centang"));
    expect(await animasi(page, '[data-testid="linimasa"] .garis-tumbuh')).toBe(harap("lk-tumbuh-y"));

    await ctx.close();
  });
}

test("progres checkout bertambah saat bagian form lengkap", async ({ browser }) => {
  const ctx = await konteks(browser, false);
  const page = await ctx.newPage();
  await buka(page, "/produk/teh-serai-jahe");
  await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
  await expect(page.getByTestId("keranjang-mini")).toBeVisible();
  await buka(page, "/masuk?kembali=/checkout");
  await masukSebagai(page, "pelanggan demo");
  await tungguPath(page, "/checkout");
  const isi = page.getByTestId("progres-checkout");
  const skala = async () => isi.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  // Pelanggan demo punya alamat terakhir, jadi alamat & pengiriman sudah lengkap (3/3).
  await expect.poll(skala).toBeCloseTo(1, 2);
  await page.getByLabel("Kode pos").fill("12");
  await expect.poll(skala).toBeCloseTo(2 / 3, 2);
  await page.getByLabel("Kode pos").fill("50111");
  await expect.poll(skala).toBeCloseTo(1, 2);
  await ctx.close();
});

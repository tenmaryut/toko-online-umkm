import type { Page } from "@playwright/test";

/** Penanda unik per run, supaya data uji tidak bentrok saat test diulang terhadap situs publik. */
export const RUN = Date.now().toString(36);

/** Buka halaman dan tunggu sampai JavaScript selesai dimuat (komponen interaktif sudah terhidrasi). */
export async function buka(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

/** Tunggu sampai pathname persis sama (query string diabaikan), lalu tunggu hidrasi. */
export async function tungguPath(page: Page, pathname: string | RegExp) {
  await page.waitForURL((u) => (typeof pathname === "string" ? u.pathname === pathname : pathname.test(u.pathname)));
  await page.waitForLoadState("networkidle");
}

/** Di halaman /masuk: isi otomatis akun demo lalu kirim. */
export async function masukSebagai(page: Page, peran: "pelanggan demo" | "admin demo") {
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: `Isi otomatis: ${peran}` }).click();
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
}

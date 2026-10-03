import { randomBytes } from "node:crypto";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Mode lokal (bawaan): test dijalankan terhadap build produksi (standalone) dengan database
 * terpisah (data/e2e) yang direset di awal. Jalankan `npm run build` sebelum `npm run test:e2e`.
 *
 * Mode URL publik: set E2E_BASE_URL (mis. TOKO_URL dari domain.env, lihat `npm run test:e2e:publik`).
 * Server lokal tidak dijalankan; test berjalan terhadap situs yang sudah dideploy.
 */
const PORT = 3000;
const URL_PUBLIK = process.env.E2E_BASE_URL?.replace(/\/+$/, "");
const BASE_URL = URL_PUBLIK ?? `http://localhost:${PORT}`;
const DATA = path.join(process.cwd(), "data", "e2e");

const serverLokal = {
  // Reset database e2e ke data demo, lalu jalankan server standalone hasil build.
  command: "node .next/standalone/scripts/reset-demo.mjs && node .next/standalone/server.js",
  url: BASE_URL,
  reuseExistingServer: false,
  timeout: 60_000,
  env: {
    NODE_ENV: "production",
    PORT: String(PORT),
    HOSTNAME: "localhost",
    SITE_URL: BASE_URL,
    DATABASE_PATH: path.join(DATA, "toko.db"),
    UPLOAD_DIR: path.join(DATA, "uploads"),
    MIGRATIONS_DIR: path.join(process.cwd(), "drizzle"),
    // Secret acak per run test (tidak pernah disimpan di repo).
    BETTER_AUTH_SECRET: randomBytes(32).toString("base64url"),
    NEXT_TELEMETRY_DISABLED: "1",
    // Mengaktifkan /uji-galat untuk memeriksa halaman 500 khusus.
    AKTIFKAN_RUTE_UJI: "1",
  },
};

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: URL_PUBLIK ? 20_000 : 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
  },
  projects: [
    {
      name: "e2e",
      testIgnore: /(screenshots|rekam-animasi)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "screenshots",
      testMatch: /screenshots\.spec\.ts/,
    },
    {
      name: "animasi",
      testMatch: /rekam-animasi\.spec\.ts/,
    },
  ],
  webServer: URL_PUBLIK ? undefined : serverLokal,
});

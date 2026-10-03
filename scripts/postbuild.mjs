/**
 * Melengkapi hasil `next build` (output standalone) supaya bisa dijalankan mandiri:
 * 1. salin public/ dan .next/static/ ke .next/standalone/,
 * 2. bundel skrip db-setup & reset-demo (esbuild) ke .next/standalone/scripts/,
 * 3. salin folder migrasi drizzle/.
 */
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const akar = process.cwd();
const standalone = path.join(akar, ".next", "standalone");
if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error("[postbuild] .next/standalone/server.js tidak ada. Jalankan `next build` dulu.");
  process.exit(1);
}

const salin = (dari, ke) => {
  fs.rmSync(ke, { recursive: true, force: true });
  fs.cpSync(dari, ke, { recursive: true });
};
salin(path.join(akar, "public"), path.join(standalone, "public"));
salin(path.join(akar, ".next", "static"), path.join(standalone, ".next", "static"));
salin(path.join(akar, "drizzle"), path.join(standalone, "drizzle"));

await build({
  entryPoints: {
    "db-setup": path.join(akar, "scripts", "db-setup.ts"),
    "reset-demo": path.join(akar, "scripts", "reset-demo.ts"),
  },
  outdir: path.join(standalone, "scripts"),
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  // Modul native tetap dari node_modules hasil tracing Next.
  external: ["better-sqlite3"],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: "warning",
});

const modulNative = path.join(standalone, "node_modules", "better-sqlite3");
if (!fs.existsSync(modulNative)) {
  console.error("[postbuild] better-sqlite3 tidak ikut ter-trace ke standalone/node_modules");
  process.exit(1);
}
console.log("[postbuild] standalone siap: public, static, drizzle, scripts/db-setup.mjs, scripts/reset-demo.mjs");

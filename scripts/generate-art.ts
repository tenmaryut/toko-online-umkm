/**
 * Menulis ilustrasi kemasan tiap produk demo ke public/images/produk/<slug>.svg.
 * Jalankan: npm run art
 */
import fs from "node:fs";
import path from "node:path";
import { DATA_PRODUK } from "../src/db/seed-data";
import { buatSvgProduk } from "../src/lib/product-art";

const folder = path.join(process.cwd(), "public", "images", "produk");
fs.mkdirSync(folder, { recursive: true });

for (const produk of DATA_PRODUK) {
  const svg = buatSvgProduk(produk.seni, `Ilustrasi kemasan ${produk.name}`);
  fs.writeFileSync(path.join(folder, `${produk.slug}.svg`), svg);
}

console.log(`${DATA_PRODUK.length} ilustrasi ditulis ke ${path.relative(process.cwd(), folder)}`);

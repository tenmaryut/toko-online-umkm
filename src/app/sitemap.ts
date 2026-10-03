import type { MetadataRoute } from "next";
import { ambilKategori, semuaProdukUntukSitemap } from "@/db/queries";
import { urlAbsolut } from "@/lib/site";

// Dibuat per request: isi katalog bisa berubah lewat dasbor admin dan reset malam.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const produk = semuaProdukUntukSitemap();
  const terbaru = produk.reduce((max, p) => (p.updatedAt > max ? p.updatedAt : max), new Date(0));
  return [
    { url: urlAbsolut("/"), lastModified: terbaru, changeFrequency: "daily", priority: 1 },
    { url: urlAbsolut("/produk"), lastModified: terbaru, changeFrequency: "daily", priority: 0.9 },
    ...ambilKategori().map((k) => ({
      url: urlAbsolut(`/kategori/${k.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...produk.map((p) => ({
      url: urlAbsolut(`/produk/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [urlAbsolut(`/og/produk/${p.slug}`)],
    })),
    { url: urlAbsolut("/tentang"), changeFrequency: "monthly", priority: 0.3 },
    { url: urlAbsolut("/privasi"), changeFrequency: "yearly", priority: 0.2 },
  ];
}

import { ImageResponse } from "next/og";
import { ambilProdukBySlug } from "@/db/queries";
import { formatRupiah } from "@/lib/format";
import { gambarProdukDataUri, KartuOg, UKURAN_OG } from "@/lib/og";
import { POLA_SLUG } from "@/lib/slug";

/** Gambar Open Graph per produk dengan URL tetap (dipakai metadata dan JSON-LD). */
export async function GET(_request: Request, { params }: RouteContext<"/og/produk/[slug]">) {
  const { slug } = await params;
  const produk = POLA_SLUG.test(slug) ? ambilProdukBySlug(slug) : undefined;
  if (!produk) return new Response("Tidak ditemukan", { status: 404 });
  const gambar = await gambarProdukDataUri(produk.imagePath);
  return new ImageResponse(
    <KartuOg judul={produk.name} subjudul={produk.categoryName} harga={formatRupiah(produk.price)} gambar={gambar} />,
    { ...UKURAN_OG, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}

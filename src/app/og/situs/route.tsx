import { ImageResponse } from "next/og";
import { gambarProdukDataUri, KartuOg, UKURAN_OG } from "@/lib/og";

/** Gambar Open Graph bawaan situs. */
export async function GET() {
  const gambar = await gambarProdukDataUri("/images/produk/kopi-arabika-lereng-pagi.svg");
  return new ImageResponse(
    <KartuOg judul="Dari lereng berkabut ke meja makanmu" subjudul="Kopi · teh rempah · camilan · sambal · kriya" gambar={gambar} />,
    { ...UKURAN_OG, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}

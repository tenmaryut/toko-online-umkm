import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { folderUnggahan } from "@/db/client";
import { hostSitus } from "./site";

export const UKURAN_OG = { width: 1200, height: 630 };

/** Membaca gambar produk (SVG bawaan atau WebP unggahan) dan mengubahnya ke PNG data URI untuk Satori. */
export async function gambarProdukDataUri(imagePath: string, sisi = 520): Promise<string | null> {
  try {
    let lokasi: string;
    if (imagePath.startsWith("/uploads/")) {
      lokasi = path.join(folderUnggahan(), path.basename(imagePath));
    } else if (imagePath.startsWith("/images/")) {
      lokasi = path.join(process.cwd(), "public", path.normalize(imagePath).replace(/^\/+/, ""));
    } else {
      return null;
    }
    const png = await sharp(await fs.readFile(/*turbopackIgnore: true*/ lokasi)).resize(sisi, sisi, { fit: "cover" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Kartu OG bermerek Lumbung Kabut. */
export function KartuOg({ judul, subjudul, harga, gambar }: { judul: string; subjudul: string; harga?: string; gambar?: string | null }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f6f2e9",
        color: "#241c15",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#34503b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e3b04b",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            LK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>Lumbung Kabut</div>
            <div style={{ fontSize: 20, color: "#574b40" }}>Toko demo portofolio · tanpa transaksi nyata</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 22, color: "#34503b", textTransform: "uppercase", letterSpacing: 3 }}>{subjudul}</div>
          <div style={{ fontSize: judul.length > 38 ? 52 : 62, fontWeight: 700, lineHeight: 1.1 }}>{judul}</div>
          {harga && <div style={{ fontSize: 44, fontWeight: 700, color: "#9c4524" }}>{harga}</div>}
        </div>
        <div style={{ fontSize: 20, color: "#574b40" }}>{hostSitus()}</div>
      </div>
      {gambar ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 560, background: "#dce5d5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- elemen Satori, bukan DOM */}
          <img src={gambar} width={500} height={500} alt="" style={{ borderRadius: 32 }} />
        </div>
      ) : (
        <div style={{ display: "flex", width: 300, background: "#34503b" }} />
      )}
    </div>
  );
}

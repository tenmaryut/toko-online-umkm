import fs from "node:fs/promises";
import path from "node:path";
import { folderUnggahan } from "@/db/client";
import { POLA_FILE_UNGGAHAN } from "@/lib/upload";

/** Menyajikan gambar unggahan admin dari UPLOAD_DIR (di luar folder build). */
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[file]">) {
  const { file } = await params;
  // Nama file wajib UUID + .webp: mencegah path traversal dan tipe file lain.
  if (!POLA_FILE_UNGGAHAN.test(file)) return new Response("Tidak ditemukan", { status: 404 });
  try {
    const data = await fs.readFile(/*turbopackIgnore: true*/ path.join(folderUnggahan(), file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Tidak ditemukan", { status: 404 });
  }
}

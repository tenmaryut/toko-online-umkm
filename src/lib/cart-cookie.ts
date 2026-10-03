import "server-only";
import { cookies } from "next/headers";
import { type Keranjang, parseKeranjang, serializeKeranjang } from "./cart";
import { urlSitus } from "./site";

export const NAMA_COOKIE_KERANJANG = "lk_keranjang";

export async function bacaKeranjang(): Promise<Keranjang> {
  const toko = await cookies();
  return parseKeranjang(toko.get(NAMA_COOKIE_KERANJANG)?.value);
}

/** Hanya bisa dipanggil dari Server Action atau Route Handler. */
export async function simpanKeranjang(keranjang: Keranjang): Promise<void> {
  const toko = await cookies();
  if (keranjang.length === 0) {
    toko.delete(NAMA_COOKIE_KERANJANG);
    return;
  }
  toko.set(NAMA_COOKIE_KERANJANG, serializeKeranjang(keranjang), {
    httpOnly: true,
    sameSite: "lax",
    secure: urlSitus().startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

import { notFound } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Contoh halaman 500 khusus, untuk demo dan test e2e (juga terhadap URL publik). Aktif hanya bila
 * AKTIFKAN_RUTE_UJI=1 (diset di unit systemd dan server uji); selain itu 404. Tidak ditautkan,
 * noindex, dan dilarang di robots.txt.
 */
export default function UjiGalat() {
  if (process.env.AKTIFKAN_RUTE_UJI !== "1") notFound();
  throw new Error("Galat uji untuk memeriksa halaman 500 khusus");
}

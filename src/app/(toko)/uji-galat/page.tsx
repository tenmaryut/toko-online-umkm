import { notFound } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Rute untuk menguji halaman 500 khusus. Hanya aktif saat AKTIFKAN_RUTE_UJI=1 (test e2e);
 * di produksi selalu 404.
 */
export default function UjiGalat() {
  if (process.env.AKTIFKAN_RUTE_UJI !== "1") notFound();
  throw new Error("Galat uji untuk memeriksa halaman 500 khusus");
}

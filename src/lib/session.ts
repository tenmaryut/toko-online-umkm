import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getAuth, type Sesi } from "./auth";

/** Sesi pengguna saat ini (di-cache per request). */
export const ambilSesi = cache(async (): Promise<Sesi | null> => {
  return getAuth().api.getSession({ headers: await headers() });
});

/** Wajib login; kalau belum, arahkan ke halaman masuk lalu kembali ke `kembali`. */
export async function wajibLogin(kembali: string): Promise<Sesi> {
  const sesi = await ambilSesi();
  if (!sesi) redirect(`/masuk?kembali=${encodeURIComponent(kembali)}`);
  return sesi;
}

/**
 * Penjaga area admin di server. Dipanggil di layout admin DAN di setiap Server Action admin,
 * karena Server Action bisa dipanggil langsung tanpa melewati halaman.
 */
export async function wajibAdmin(): Promise<Sesi> {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/masuk?kembali=/admin");
  if (sesi.user.role !== "admin") notFound();
  return sesi;
}

/** Versi untuk Server Action: melempar error alih-alih redirect/notFound. */
export async function pastikanAdmin(): Promise<Sesi> {
  const sesi = await ambilSesi();
  if (!sesi || sesi.user.role !== "admin") {
    throw new Error("Tidak berwenang");
  }
  return sesi;
}

/** Admin demo (kredensial publik) hanya melihat data pribadi pelanggan secara tersamar. */
export function adminDemo(sesi: Sesi): boolean {
  return sesi.user.role === "admin" && Boolean(sesi.user.isDemo);
}

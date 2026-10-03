import type { Metadata } from "next";
import Link from "next/link";
import { DaftarPesananPelanggan } from "@/components/kartu-pesanan";
import { ambilPesananPengguna } from "@/db/queries";
import { wajibLogin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Riwayat pesanan",
  robots: { index: false, follow: false },
};

export default async function HalamanRiwayatPesanan() {
  const sesi = await wajibLogin("/akun/pesanan");
  const pesanan = await ambilPesananPengguna(sesi.user.id);
  return (
    <div className="wadah max-w-4xl py-10 sm:py-14">
      <Link href="/akun" className="tombol-teks">
        ← Kembali ke akun
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Riwayat pesanan</h1>
      <p className="mt-2 text-arang-2">{pesanan.length} pesanan.</p>
      <div className="mt-6">
        {pesanan.length === 0 ? (
          <p className="rounded-[var(--radius-kartu)] border border-dashed border-arang/25 px-6 py-10 text-center">Belum ada pesanan.</p>
        ) : (
          <DaftarPesananPelanggan pesanan={pesanan} />
        )}
      </div>
    </div>
  );
}

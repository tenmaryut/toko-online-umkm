import type { Metadata } from "next";
import Link from "next/link";
import { keluarAction } from "@/actions/auth";
import { IkonKeluar, IkonPanahKanan } from "@/components/ikon";
import { DaftarPesananPelanggan } from "@/components/kartu-pesanan";
import { TombolAksi } from "@/components/tombol-aksi";
import { ambilPesananPengguna } from "@/db/queries";
import { formatTanggal } from "@/lib/format";
import { wajibLogin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Akun saya",
  robots: { index: false, follow: false },
};

export default async function HalamanAkun() {
  const sesi = await wajibLogin("/akun");
  const pesanan = await ambilPesananPengguna(sesi.user.id);
  const admin = sesi.user.role === "admin";

  return (
    <div className="wadah py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lumut">Akun saya</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Halo, {sesi.user.name}</h1>
        </div>
        <form action={keluarAction}>
          <TombolAksi className="tombol-garis">
            <IkonKeluar ukuran={18} /> Keluar
          </TombolAksi>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section aria-labelledby="judul-profil" className="kartu h-fit p-5">
          <h2 id="judul-profil" className="font-display text-lg font-semibold">
            Profil
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-arang-2">Nama</dt>
              <dd className="font-medium">{sesi.user.name}</dd>
            </div>
            <div>
              <dt className="text-arang-2">Email</dt>
              <dd className="break-all font-medium">{sesi.user.email}</dd>
            </div>
            <div>
              <dt className="text-arang-2">Bergabung</dt>
              <dd className="font-medium">{formatTanggal(sesi.user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-arang-2">Peran</dt>
              <dd className="font-medium">{admin ? "Admin" : "Pelanggan"}</dd>
            </div>
          </dl>
          {admin && (
            <Link href="/admin" className="tombol-lumut mt-5 w-full">
              Buka dasbor admin
            </Link>
          )}
          <p className="mt-5 text-xs text-arang-2">Akun dan pesanan di toko demo ini dihapus otomatis setiap pukul 00.00 WIB.</p>
        </section>

        <section aria-labelledby="judul-pesanan">
          <div className="flex items-end justify-between gap-4">
            <h2 id="judul-pesanan" className="font-display text-xl font-semibold">
              Pesanan terbaru
            </h2>
            {pesanan.length > 5 && (
              <Link href="/akun/pesanan" className="tombol-teks">
                Semua pesanan <IkonPanahKanan ukuran={16} />
              </Link>
            )}
          </div>
          <div className="mt-4">
            {pesanan.length === 0 ? (
              <div className="rounded-[var(--radius-kartu)] border border-dashed border-arang/25 px-6 py-10 text-center">
                <p className="font-semibold">Belum ada pesanan</p>
                <Link href="/produk" className="tombol-utama mt-4">
                  Mulai belanja
                </Link>
              </div>
            ) : (
              <DaftarPesananPelanggan pesanan={pesanan.slice(0, 5)} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

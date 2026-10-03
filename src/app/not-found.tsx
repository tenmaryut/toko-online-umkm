import type { Metadata } from "next";
import Link from "next/link";
import { FooterToko } from "@/components/footer-toko";
import { HeaderToko } from "@/components/header-toko";
import { IkonCari } from "@/components/ikon";
import { IlustrasiKabut } from "@/components/ilustrasi";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: { index: false, follow: true },
};

export default function TidakDitemukan() {
  return (
    <>
      <HeaderToko />
      <main id="konten" className="flex-1">
        <div className="wadah max-w-2xl py-16 text-center sm:py-24">
          <IlustrasiKabut className="mx-auto h-36 w-auto" />
          <p className="mt-6 font-mono text-sm font-semibold text-tanah">Galat 404</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Halaman ini hilang di balik kabut</h1>
          <p className="mx-auto mt-3 max-w-md text-arang-2">
            Mungkin tautannya salah ketik, produknya sudah tidak dijual, atau data demo baru saja direset.
          </p>
          <form action="/produk" role="search" className="mx-auto mt-8 flex max-w-md gap-2">
            <label htmlFor="cari-404" className="sr-only">
              Cari produk
            </label>
            <div className="relative flex-1">
              <IkonCari ukuran={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-arang-2" />
              <input id="cari-404" name="q" type="search" placeholder="Cari produk…" className="masukan pl-10" />
            </div>
            <button type="submit" className="tombol-utama">
              Cari
            </button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="tombol-garis">
              Ke beranda
            </Link>
            <Link href="/produk" className="tombol-garis">
              Lihat katalog
            </Link>
          </div>
        </div>
      </main>
      <FooterToko />
    </>
  );
}

import Link from "next/link";
import { ambilKategori } from "@/db/queries";
import { jumlahItem } from "@/lib/cart";
import { bacaKeranjang } from "@/lib/cart-cookie";
import { ambilSesi } from "@/lib/session";
import { IkonCari, IkonKeranjang, IkonPengguna } from "./ikon";
import { Logo } from "./logo";
import { LencanaKeranjang } from "./umpan-balik";

export async function HeaderToko() {
  const [sesi, keranjang] = await Promise.all([ambilSesi(), bacaKeranjang()]);
  const kategori = ambilKategori();
  const jumlah = jumlahItem(keranjang);
  const admin = sesi?.user.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-garis/80 bg-kertas">
      <div className="wadah flex h-16 items-center gap-1 sm:gap-4">
        <Logo />
        <form action="/produk" role="search" className="relative ml-2 hidden max-w-sm flex-1 md:block lg:ml-6">
          <label htmlFor="cari-header" className="sr-only">
            Cari produk
          </label>
          <IkonCari ukuran={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-arang-2" />
          <input
            id="cari-header"
            name="q"
            type="search"
            placeholder="Cari kopi, sambal, keripik…"
            className="masukan rounded-full py-2 pl-10"
          />
        </form>
        <nav aria-label="Navigasi utama" className="ml-auto flex items-center sm:gap-1">
          <Link
            href="/produk"
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-semibold text-arang hover:bg-kertas-2 md:inline-flex"
          >
            Katalog
          </Link>
          {admin && (
            <Link
              href="/admin"
              className="hidden min-h-11 items-center rounded-full px-3 text-sm font-semibold text-lumut hover:bg-lumut-muda lg:inline-flex"
            >
              Dasbor admin
            </Link>
          )}
          <Link
            href="/produk#cari"
            className="grid size-11 place-items-center rounded-full text-arang hover:bg-kertas-2 md:hidden"
            aria-label="Cari produk"
          >
            <IkonCari />
          </Link>
          <Link
            href={sesi ? "/akun" : "/masuk"}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2 text-sm font-semibold text-arang hover:bg-kertas-2 sm:px-3"
          >
            <IkonPengguna />
            <span className="sr-only sm:not-sr-only">{sesi ? "Akun" : "Masuk"}</span>
          </Link>
          <Link
            href="/keranjang"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full bg-lumut px-2.5 text-sm font-semibold text-kertas hover:bg-lumut-tua sm:gap-2 sm:px-4"
          >
            <IkonKeranjang />
            <span className="sr-only sm:not-sr-only">Keranjang</span>
            <LencanaKeranjang jumlah={jumlah} />
          </Link>
        </nav>
      </div>
      <nav aria-label="Kategori produk" className="border-t border-garis/70">
        <ul className="wadah flex gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
          <li>
            <Link
              href="/produk"
              className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-arang/15 bg-white/60 px-3.5 text-sm font-medium text-arang hover:border-lumut hover:bg-lumut-muda"
            >
              Semua produk
            </Link>
          </li>
          {kategori.map((k) => (
            <li key={k.id}>
              <Link
                href={`/kategori/${k.slug}`}
                className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-arang/15 bg-white/60 px-3.5 text-sm font-medium text-arang hover:border-lumut hover:bg-lumut-muda"
              >
                {k.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

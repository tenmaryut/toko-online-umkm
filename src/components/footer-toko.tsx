import Link from "next/link";
import { ambilKategori } from "@/db/queries";
import { SITUS } from "@/lib/site";
import { TandaLumbung } from "./logo";

export function FooterToko() {
  const kategori = ambilKategori();
  return (
    <footer className="mt-20 bg-lumut-tua text-kertas">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" className="block h-8 w-full -translate-y-px bg-kertas sm:h-12">
        <path d="M0 60V34c160-30 330-36 520-10s380 30 560 4 260-26 360-10v42Z" fill="#233628" />
      </svg>
      <div className="wadah grid grid-cols-1 gap-10 pb-12 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <TandaLumbung ukuran={40} />
            <p className="font-display text-xl font-semibold">{SITUS.nama}</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-kertas/85">
            Lumbung Kabut adalah merek UMKM fiktif yang dibuat untuk demo portofolio: katalog, keranjang, checkout,
            akun pelanggan, dan dasbor admin. Produk, harga, dan pelanggan di situs ini hanyalah contoh.
          </p>
          <p className="mt-3 max-w-md text-sm font-semibold text-kunyit-muda">{SITUS.bannerDemo}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-kertas/75">Belanja</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/produk" className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                Semua produk
              </Link>
            </li>
            {kategori.map((k) => (
              <li key={k.id}>
                <Link href={`/kategori/${k.slug}`} className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                  {k.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-kertas/75">Informasi</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/tentang" className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                Tentang demo ini
              </Link>
            </li>
            <li>
              <Link href="/privasi" className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                Kebijakan privasi
              </Link>
            </li>
            <li>
              <Link href="/akun" className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                Akun saya
              </Link>
            </li>
            <li>
              <Link href="/keranjang" className="inline-block py-1 hover:text-kunyit-muda hover:underline">
                Keranjang
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-kertas/15">
        <p className="wadah py-5 text-xs leading-relaxed text-kertas/80">
          © 2026 Lumbung Kabut (merek fiktif). Ilustrasi produk dibuat sendiri. Pembayaran dan pengiriman hanya simulasi;
          data demo dihapus otomatis setiap pukul 00.00 WIB.
        </p>
      </div>
    </footer>
  );
}

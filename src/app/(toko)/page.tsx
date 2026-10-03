import type { Metadata } from "next";
import Link from "next/link";
import { IkonPanahKanan, IkonStruk, IkonTruk } from "@/components/ikon";
import { IlustrasiHero } from "@/components/ilustrasi";
import { JsonLd } from "@/components/json-ld";
import { GridProduk } from "@/components/kartu-produk";
import { ambilKategori, ambilProdukTerlaris, ambilProdukUnggulan } from "@/db/queries";
import { AKUN_DEMO, SITUS, urlAbsolut } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITUS.nama} · Toko demo hasil kebun dan dapur`,
    description: SITUS.deskripsi,
    url: "/",
    images: [{ url: "/og/situs", width: 1200, height: 630, alt: "Lumbung Kabut, toko demo hasil kebun dan dapur" }],
  },
};

const GAMBAR_KATEGORI: Record<string, string> = {
  kopi: "kopi-arabika-lereng-pagi",
  "teh-rempah": "teh-serai-jahe",
  camilan: "keripik-singkong-balado",
  "sambal-bumbu": "sambal-bawang-lereng",
  "kriya-dapur": "tas-belanja-kain-lurik",
};

export default function Beranda() {
  const kategori = ambilKategori();
  const unggulan = ambilProdukUnggulan(8);
  const terlaris = ambilProdukTerlaris(4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITUS.nama,
          url: urlAbsolut("/"),
          inLanguage: "id-ID",
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${urlAbsolut("/produk")}?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="wadah grid grid-cols-1 items-center gap-10 pb-14 pt-10 md:grid-cols-[1.05fr_minmax(0,1fr)] md:pt-16 lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-lumut-muda px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-lumut-tua">
              UMKM fiktif · demo portofolio
            </p>
            <h1 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-arang sm:text-5xl lg:text-6xl">
              Dari lereng berkabut ke meja makanmu.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-arang-2 sm:text-lg">
              Kopi sangrai kecil, teh rempah, camilan renyah, sambal botol, dan kriya dapur dari sebuah lumbung khayalan
              di lereng gunung. Coba alur belanjanya dari katalog sampai pesanan dikirim.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/produk" className="tombol-utama px-6 text-base">
                Jelajahi katalog <IkonPanahKanan ukuran={18} />
              </Link>
              <Link href="#cara-kerja" className="tombol-garis px-6 text-base">
                Cara kerja demo
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-garis pt-6 text-sm">
              <div>
                <dt className="text-arang-2">Ongkir</dt>
                <dd className="mt-1 font-semibold">Tetap per zona</dd>
              </div>
              <div>
                <dt className="text-arang-2">Pembayaran</dt>
                <dd className="mt-1 font-semibold">Simulasi</dd>
              </div>
              <div>
                <dt className="text-arang-2">Data demo</dt>
                <dd className="mt-1 font-semibold">Reset tiap malam</dd>
              </div>
            </dl>
          </div>
          <IlustrasiHero className="h-auto w-full drop-shadow-[0_24px_40px_rgb(36_28_21/0.18)]" />
        </div>
      </section>

      {/* Kategori */}
      <section aria-labelledby="judul-kategori" className="latar-anyaman py-14">
        <div className="wadah">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="judul-kategori" className="judul-bagian">
                Isi lumbung
              </h2>
              <p className="mt-2 text-arang-2">Lima rak, dari seduhan pagi sampai perlengkapan dapur.</p>
            </div>
            <Link href="/produk" className="tombol-teks">
              Semua produk <IkonPanahKanan ukuran={16} />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {kategori.map((k) => (
              <li key={k.id}>
                <Link
                  href={`/kategori/${k.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-kartu)] border border-garis bg-kertas transition-shadow hover:shadow-[0_10px_30px_-18px_rgb(36_28_21/0.5)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi SVG ringan */}
                  <img
                    src={`/images/produk/${GAMBAR_KATEGORI[k.slug] ?? "kopi-arabika-lereng-pagi"}.svg`}
                    alt=""
                    width={600}
                    height={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover object-[50%_60%] transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="flex flex-1 flex-col p-3 sm:p-4">
                    <span className="font-display text-lg font-semibold leading-tight">{k.name}</span>
                    <span className="mt-1 text-sm text-arang-2">{k.jumlahProduk} produk</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Produk pilihan */}
      <section aria-labelledby="judul-pilihan" className="wadah py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="judul-pilihan" className="judul-bagian">
              Pilihan dari lumbung
            </h2>
            <p className="mt-2 text-arang-2">Produk yang sedang ditonjolkan pemilik toko (demo).</p>
          </div>
          <Link href="/produk?urut=terlaris" className="tombol-teks">
            Lihat yang terlaris <IkonPanahKanan ukuran={16} />
          </Link>
        </div>
        <div className="mt-8">
          <GridProduk produk={unggulan} />
        </div>
      </section>

      {/* Cara kerja demo */}
      <section id="cara-kerja" aria-labelledby="judul-cara-kerja" className="bg-lumut text-kertas">
        <div className="wadah grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
          <div>
            <h2 id="judul-cara-kerja" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Cara mencoba toko demo ini
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                {
                  judul: "Pilih produk",
                  isi: "Cari, saring, dan urutkan katalog, lalu tambahkan ke keranjang. Isi keranjang tetap ada walau halaman dimuat ulang.",
                },
                {
                  judul: "Checkout dengan pembayaran simulasi",
                  isi: "Isi alamat, pilih layanan kirim (ongkir tetap per zona), lalu bayar dengan tombol simulasi. Tidak ada uang yang berpindah.",
                },
                {
                  judul: "Pantau dan proses pesanan",
                  isi: "Pelanggan melihat status pesanan di akunnya. Admin mengubah status: dibayar, dikemas, dikirim, selesai.",
                },
              ].map((l, i) => (
                <li key={l.judul} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kunyit font-display text-lg font-semibold text-arang">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{l.judul}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-kertas/85">{l.isi}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[var(--radius-kartu)] bg-kertas p-6 text-arang">
            <h3 className="font-display text-xl font-semibold">Akun demo</h3>
            <p className="mt-2 text-sm text-arang-2">Silakan dipakai. Semua data demo dikembalikan seperti semula setiap pukul 00.00 WIB.</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-garis bg-white/70 p-4">
                <dt className="flex items-center gap-2 font-semibold">
                  <IkonStruk ukuran={18} /> Pelanggan
                </dt>
                <dd className="mt-2 break-all font-mono text-[0.82rem]">
                  {AKUN_DEMO.pelanggan.email}
                  <br />
                  {AKUN_DEMO.pelanggan.password}
                </dd>
              </div>
              <div className="rounded-2xl border border-garis bg-white/70 p-4">
                <dt className="flex items-center gap-2 font-semibold">
                  <IkonTruk ukuran={18} /> Admin
                </dt>
                <dd className="mt-2 break-all font-mono text-[0.82rem]">
                  {AKUN_DEMO.admin.email}
                  <br />
                  {AKUN_DEMO.admin.password}
                </dd>
              </div>
            </dl>
            <Link href="/masuk" className="tombol-utama mt-5 w-full">
              Masuk dengan akun demo
            </Link>
          </div>
        </div>
      </section>

      {/* Terlaris */}
      <section aria-labelledby="judul-terlaris" className="wadah py-14">
        <h2 id="judul-terlaris" className="judul-bagian">
          Paling sering dibeli
        </h2>
        <p className="mt-2 text-arang-2">Dihitung dari pesanan contoh di data demo.</p>
        <div className="mt-8">
          <GridProduk produk={terlaris} />
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IkonTruk } from "@/components/ikon";
import { JsonLd } from "@/components/json-ld";
import { GridProduk, LabelStok } from "@/components/kartu-produk";
import { FormTambahKeranjang } from "@/components/tombol-keranjang";
import { ambilProdukBySlug, ambilProdukTerkait } from "@/db/queries";
import { formatBerat, formatRupiah } from "@/lib/format";
import { LAYANAN_IDS, LAYANAN, TARIF, ZONA, ZONA_IDS } from "@/lib/shipping";
import { urlAbsolut } from "@/lib/site";
import { POLA_SLUG } from "@/lib/slug";

async function produkDari(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  if (!POLA_SLUG.test(slug)) return undefined;
  return ambilProdukBySlug(slug);
}

function ringkas(teks: string, maks = 155) {
  if (teks.length <= maks) return teks;
  return `${teks.slice(0, maks - 1).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const produk = await produkDari(params);
  if (!produk) return { title: "Produk tidak ditemukan" };
  const deskripsi = ringkas(`${produk.name} seharga ${formatRupiah(produk.price)}. ${produk.description}`);
  return {
    title: produk.name,
    description: deskripsi,
    alternates: { canonical: `/produk/${produk.slug}` },
    openGraph: {
      type: "website",
      title: `${produk.name} · Lumbung Kabut`,
      description: deskripsi,
      url: `/produk/${produk.slug}`,
      images: [{ url: `/og/produk/${produk.slug}`, width: 1200, height: 630, alt: `Kartu produk ${produk.name}` }],
    },
    twitter: { card: "summary_large_image", title: produk.name, description: deskripsi },
  };
}

export default async function HalamanProduk({ params }: PageProps<"/produk/[slug]">) {
  const produk = await produkDari(params);
  if (!produk) notFound();
  const terkait = ambilProdukTerkait(produk.categoryId, produk.id, 4);
  const url = urlAbsolut(`/produk/${produk.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: produk.name,
          description: produk.description,
          sku: `LK-${String(produk.id).padStart(4, "0")}`,
          image: [urlAbsolut(`/og/produk/${produk.slug}`), urlAbsolut(produk.imagePath)],
          category: produk.categoryName,
          brand: { "@type": "Brand", name: "Lumbung Kabut" },
          weight: { "@type": "QuantitativeValue", value: produk.weightGrams, unitCode: "GRM" },
          url,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "IDR",
            price: produk.price,
            availability: produk.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Lumbung Kabut (toko demo)" },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Beranda", item: urlAbsolut("/") },
            { "@type": "ListItem", position: 2, name: produk.categoryName, item: urlAbsolut(`/kategori/${produk.categorySlug}`) },
            { "@type": "ListItem", position: 3, name: produk.name, item: url },
          ],
        }}
      />

      <div className="wadah pt-6 sm:pt-8">
        <nav aria-label="Remah roti" className="text-sm text-arang-2">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-arang hover:underline">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/kategori/${produk.categorySlug}`} className="hover:text-arang hover:underline">
                {produk.categoryName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-arang">
              {produk.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-[2rem] border border-garis bg-kertas-2 md:sticky md:top-32 md:self-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi SVG/WebP sudah berukuran pas */}
            <img
              src={produk.imagePath}
              alt={`Ilustrasi kemasan ${produk.name}`}
              width={600}
              height={600}
              fetchPriority="high"
              className="aspect-square h-auto w-full object-cover"
            />
          </div>

          <div>
            <Link
              href={`/kategori/${produk.categorySlug}`}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-lumut hover:underline"
            >
              {produk.categoryName}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{produk.name}</h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-2xl font-bold text-arang sm:text-3xl" data-testid="harga-produk">
                {formatRupiah(produk.price)}
              </p>
              <LabelStok stok={produk.stock} />
            </div>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-arang-2">
              <div className="flex gap-1.5">
                <dt>Berat:</dt>
                <dd className="font-medium text-arang">{formatBerat(produk.weightGrams)}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Stok:</dt>
                <dd className="font-medium text-arang" data-testid="stok-produk">
                  {produk.stock}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Terjual:</dt>
                <dd className="font-medium text-arang">{produk.soldCount}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-garis pt-6">
              <FormTambahKeranjang productId={produk.id} stok={produk.stock} />
            </div>

            <section aria-labelledby="judul-deskripsi" className="mt-8">
              <h2 id="judul-deskripsi" className="font-display text-xl font-semibold">
                Tentang produk ini
              </h2>
              <p className="mt-3 leading-relaxed text-arang-2">{produk.description}</p>
              <p className="mt-3 text-sm text-arang-2">
                Produk fiktif untuk demo. Foto diganti ilustrasi kemasan buatan sendiri.
              </p>
            </section>

            <section aria-labelledby="judul-ongkir" className="kartu mt-8 p-5">
              <h2 id="judul-ongkir" className="flex items-center gap-2 font-display text-xl font-semibold">
                <IkonTruk /> Ongkir tetap per zona
              </h2>
              <p className="mt-2 text-sm text-arang-2">Tarif tidak bergantung berat. Zona ditentukan dari provinsi tujuan.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Tarif ongkos kirim per zona dan layanan</caption>
                  <thead>
                    <tr className="border-b border-garis text-arang-2">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Zona
                      </th>
                      {LAYANAN_IDS.map((l) => (
                        <th key={l} scope="col" className="py-2 pr-3 font-semibold">
                          {LAYANAN[l].nama}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ZONA_IDS.map((z) => (
                      <tr key={z} className="border-b border-garis/60 last:border-0">
                        <th scope="row" className="py-2 pr-2 font-medium sm:pr-3">
                          {ZONA[z].nama}
                          <span className="block text-xs font-normal text-arang-2">{ZONA[z].wilayah}</span>
                        </th>
                        {LAYANAN_IDS.map((l) => (
                          <td key={l} className="py-2 pr-3">
                            {formatRupiah(TARIF[z][l].biaya)}
                            <span className="block text-xs text-arang-2">{TARIF[z][l].estimasi}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {terkait.length > 0 && (
          <section aria-labelledby="judul-terkait" className="mt-16">
            <h2 id="judul-terkait" className="judul-bagian">
              Dari rak yang sama
            </h2>
            <div className="mt-6">
              <GridProduk produk={terkait} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}

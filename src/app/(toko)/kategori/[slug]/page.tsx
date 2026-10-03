import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Katalog } from "@/components/katalog";
import { ambilKategoriBySlug } from "@/db/queries";
import { urlAbsolut } from "@/lib/site";
import { POLA_SLUG } from "@/lib/slug";
import { skemaQueryKatalog } from "@/lib/validation";

async function kategoriDari(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  if (!POLA_SLUG.test(slug)) return undefined;
  return ambilKategoriBySlug(slug);
}

export async function generateMetadata({ params }: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const kategori = await kategoriDari(params);
  if (!kategori) return { title: "Kategori tidak ditemukan" };
  const judul = `${kategori.name}`;
  return {
    title: judul,
    description: `${kategori.description} Pilihan ${kategori.name.toLowerCase()} di Lumbung Kabut, toko demo UMKM.`,
    alternates: { canonical: `/kategori/${kategori.slug}` },
    openGraph: { title: `${judul} · Lumbung Kabut`, url: `/kategori/${kategori.slug}` },
  };
}

export default async function HalamanKategori({ params, searchParams }: PageProps<"/kategori/[slug]">) {
  const kategori = await kategoriDari(params);
  if (!kategori) notFound();
  const query = skemaQueryKatalog.parse(await searchParams);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Beranda", item: urlAbsolut("/") },
            { "@type": "ListItem", position: 2, name: "Katalog", item: urlAbsolut("/produk") },
            { "@type": "ListItem", position: 3, name: kategori.name, item: urlAbsolut(`/kategori/${kategori.slug}`) },
          ],
        }}
      />
      <div className="wadah pb-6 pt-8 sm:pt-10">
        <nav aria-label="Remah roti" className="text-sm text-arang-2">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-arang hover:underline">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/produk" className="hover:text-arang hover:underline">
                Katalog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-arang">
              {kategori.name}
            </li>
          </ol>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{kategori.name}</h1>
        <p className="mt-2 max-w-2xl text-arang-2">{kategori.description}</p>
      </div>
      <Katalog query={query} dasar={`/kategori/${kategori.slug}`} kategoriTetap={kategori.slug} />
    </>
  );
}

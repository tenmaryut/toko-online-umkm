import type { Metadata } from "next";
import { Katalog } from "@/components/katalog";
import { skemaQueryKatalog } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Katalog produk",
  description:
    "Katalog lengkap Lumbung Kabut (toko demo): kopi, teh dan rempah, camilan, sambal dan bumbu, serta kriya dapur. Cari, saring harga, dan urutkan produk.",
  alternates: { canonical: "/produk" },
  openGraph: { title: "Katalog produk · Lumbung Kabut", url: "/produk" },
};

export default async function HalamanKatalog({ searchParams }: PageProps<"/produk">) {
  const query = skemaQueryKatalog.parse(await searchParams);
  return (
    <>
      <div className="wadah pb-6 pt-8 sm:pt-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Katalog</h1>
        <p className="mt-2 max-w-2xl text-arang-2">
          Semua isi lumbung dalam satu rak. Harga dalam Rupiah dan stok diperbarui setiap ada pesanan.
        </p>
      </div>
      <Katalog query={query} dasar="/produk" />
    </>
  );
}

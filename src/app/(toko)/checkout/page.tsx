import type { Metadata } from "next";
import Link from "next/link";
import { FormCheckout } from "@/components/form-checkout";
import { alamatTerakhir, ambilProdukUntukKeranjang } from "@/db/queries";
import { rekonsiliasiKeranjang } from "@/lib/cart";
import { bacaKeranjang } from "@/lib/cart-cookie";
import { wajibLogin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function HalamanCheckout() {
  const sesi = await wajibLogin("/checkout");
  const keranjang = await bacaKeranjang();
  const { baris, subtotal } = rekonsiliasiKeranjang(keranjang, ambilProdukUntukKeranjang(keranjang.map((b) => b.productId)));
  const terakhir = alamatTerakhir(sesi.user.id);

  return (
    <div className="wadah py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
      {baris.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-kartu)] border border-dashed border-arang/25 px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Keranjang kosong</p>
          <p className="mt-2 text-sm text-arang-2">Tambahkan produk dulu sebelum checkout.</p>
          <Link href="/produk" className="tombol-utama mt-6">
            Lihat katalog
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <FormCheckout
            item={baris.map((b) => ({
              id: b.product.id,
              nama: b.product.name,
              jumlah: b.quantity,
              total: b.lineTotal,
              gambar: b.product.imagePath,
            }))}
            subtotal={subtotal}
            bawaan={terakhir ?? { recipientName: sesi.user.name }}
          />
        </div>
      )}
    </div>
  );
}

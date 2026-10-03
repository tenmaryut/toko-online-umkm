import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { LABEL_PEMBAYARAN, type MetodePembayaran } from "@/lib/order-status";
import { LAYANAN, type LayananId, ZONA, type ZonaId } from "@/lib/shipping";

type Pesanan = {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  shippingZone: string;
  shippingService: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  paymentMethod: MetodePembayaran;
  note: string;
  items: { id: number; productName: string; productSlug: string; unitPrice: number; quantity: number }[];
};

/** Rincian barang, alamat, dan biaya; dipakai halaman pesanan pelanggan dan admin. */
export function RincianPesanan({ pesanan, tautanProduk = true }: { pesanan: Pesanan; tautanProduk?: boolean }) {
  const zona = ZONA[pesanan.shippingZone as ZonaId];
  const layanan = LAYANAN[pesanan.shippingService as LayananId];
  return (
    <div className="space-y-6">
      <section aria-labelledby="judul-barang" className="kartu overflow-hidden">
        <h2 id="judul-barang" className="border-b border-garis px-5 py-3 font-display text-lg font-semibold">
          Barang
        </h2>
        <ul className="divide-y divide-garis">
          {pesanan.items.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
              <span>
                {tautanProduk ? (
                  <Link href={`/produk/${i.productSlug}`} className="font-medium hover:underline">
                    {i.productName}
                  </Link>
                ) : (
                  <span className="font-medium">{i.productName}</span>
                )}
                <span className="block text-arang-2">
                  {i.quantity} × {formatRupiah(i.unitPrice)}
                </span>
              </span>
              <span className="font-semibold">{formatRupiah(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-garis px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatRupiah(pesanan.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>
              Ongkir {zona?.nama} · {layanan?.nama}
            </dt>
            <dd>{formatRupiah(pesanan.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-garis pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd data-testid="total-pesanan">{formatRupiah(pesanan.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section aria-labelledby="judul-alamat" className="kartu p-5 text-sm">
          <h2 id="judul-alamat" className="font-display text-lg font-semibold">
            Dikirim ke
          </h2>
          <p className="mt-2 font-medium">{pesanan.recipientName}</p>
          <p className="text-arang-2">{pesanan.phone}</p>
          <p className="mt-1">{pesanan.addressLine}</p>
          <p>
            {pesanan.city}, {pesanan.province} {pesanan.postalCode}
          </p>
          {pesanan.note && <p className="mt-2 rounded-xl bg-kertas-2 p-2 text-arang-2">Catatan: {pesanan.note}</p>}
        </section>
        <section aria-labelledby="judul-bayar" className="kartu p-5 text-sm">
          <h2 id="judul-bayar" className="font-display text-lg font-semibold">
            Pembayaran
          </h2>
          <p className="mt-2">{LABEL_PEMBAYARAN[pesanan.paymentMethod]}</p>
          <p className="mt-1 text-arang-2">
            Layanan kirim: {layanan?.nama} ({zona?.wilayah})
          </p>
        </section>
      </div>
    </div>
  );
}

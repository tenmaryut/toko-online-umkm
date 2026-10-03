import type { Metadata } from "next";
import Link from "next/link";
import { hapusItemAction, ubahJumlahAction } from "@/actions/keranjang";
import { rapikanKeranjangAction } from "@/actions/pesanan";
import { IkonKurang, IkonPanahKanan, IkonPeringatan, IkonSampah, IkonTambah } from "@/components/ikon";
import { IlustrasiKabut } from "@/components/ilustrasi";
import { TombolAksi } from "@/components/tombol-aksi";
import { ambilProdukUntukKeranjang } from "@/db/queries";
import { jumlahItem, rekonsiliasiKeranjang } from "@/lib/cart";
import { bacaKeranjang } from "@/lib/cart-cookie";
import { formatRupiah } from "@/lib/format";
import { TARIF } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false, follow: true },
};

export default async function HalamanKeranjang() {
  const keranjang = await bacaKeranjang();
  const produk = ambilProdukUntukKeranjang(keranjang.map((b) => b.productId));
  const { baris, masalah, subtotal, keranjang: rapi } = rekonsiliasiKeranjang(keranjang, produk);

  return (
    <div className="wadah py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Keranjang</h1>

      {baris.length === 0 && masalah.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-kartu)] border border-dashed border-arang/25 px-6 py-12 text-center">
          <IlustrasiKabut className="mx-auto h-28 w-auto" />
          <p className="mt-4 font-display text-xl font-semibold">Keranjang masih kosong</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-arang-2">Isi keranjang tersimpan di peramban ini dan tetap ada walau halaman dimuat ulang.</p>
          <Link href="/produk" className="tombol-utama mt-6">
            Mulai belanja <IkonPanahKanan ukuran={18} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            {masalah.length > 0 && (
              <div role="status" className="mb-5 rounded-2xl border border-kunyit/60 bg-kunyit-muda p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <IkonPeringatan ukuran={18} /> Ada perubahan stok
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  {masalah.map((m) => (
                    <li key={m.productId}>
                      {m.jenis === "stok-kurang"
                        ? `${m.nama}: stok tinggal ${m.tersedia}, jumlah disesuaikan.`
                        : "Satu produk sudah tidak tersedia dan tidak dihitung."}
                    </li>
                  ))}
                </ul>
                <form action={rapikanKeranjangAction} className="mt-3">
                  <TombolAksi className="tombol-garis min-h-9 py-1.5">Perbarui keranjang</TombolAksi>
                </form>
              </div>
            )}

            <ul className="divide-y divide-garis rounded-[var(--radius-kartu)] border border-garis bg-white/70" aria-label="Isi keranjang">
              {baris.map(({ product: p, quantity, lineTotal }) => (
                <li key={p.id} className="flex gap-4 p-4" data-testid="baris-keranjang">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi kecil */}
                  <img src={p.imagePath} alt="" width={96} height={96} className="size-20 shrink-0 rounded-xl bg-kertas-2 object-cover sm:size-24" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/produk/${p.slug}`} className="font-display font-semibold leading-snug hover:underline">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-arang-2">{formatRupiah(p.price)} / barang</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-arang/25 bg-white">
                          <form action={ubahJumlahAction}>
                            <input type="hidden" name="productId" value={p.id} />
                            <input type="hidden" name="quantity" value={quantity - 1} />
                            <TombolAksi label={`Kurangi jumlah ${p.name}`} className="grid size-10 place-items-center rounded-full hover:bg-kertas-2">
                              <IkonKurang ukuran={16} />
                            </TombolAksi>
                          </form>
                          <span className="min-w-8 text-center font-semibold" aria-label={`Jumlah ${p.name}`} data-testid="jumlah-baris">
                            {quantity}
                          </span>
                          <form action={ubahJumlahAction}>
                            <input type="hidden" name="productId" value={p.id} />
                            <input type="hidden" name="quantity" value={quantity + 1} />
                            <TombolAksi
                              label={`Tambah jumlah ${p.name}`}
                              className="grid size-10 place-items-center rounded-full hover:bg-kertas-2 disabled:opacity-40"
                            >
                              <IkonTambah ukuran={16} />
                            </TombolAksi>
                          </form>
                        </div>
                        <form action={hapusItemAction}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="quantity" value={0} />
                          <TombolAksi label={`Hapus ${p.name} dari keranjang`} className="grid size-10 place-items-center rounded-full text-arang-2 hover:bg-bahaya-muda hover:text-bahaya">
                            <IkonSampah ukuran={18} />
                          </TombolAksi>
                        </form>
                      </div>
                      {quantity >= p.stock && <p className="mt-2 text-xs text-tanah-tua">Sudah mencapai stok tersedia ({p.stock}).</p>}
                    </div>
                    <p className="font-bold sm:text-right">{formatRupiah(lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside aria-labelledby="judul-ringkasan" className="kartu h-fit p-5 lg:sticky lg:top-32">
            <h2 id="judul-ringkasan" className="font-display text-xl font-semibold">
              Ringkasan
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal ({jumlahItem(rapi)} barang)</dt>
                <dd className="font-semibold" data-testid="subtotal-keranjang">
                  {formatRupiah(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-arang-2">
                <dt>Ongkir</dt>
                <dd>mulai {formatRupiah(TARIF["zona-1"].reguler.biaya)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-arang-2">Ongkir tetap per zona dihitung di halaman checkout setelah provinsi tujuan dipilih.</p>
            <Link href="/checkout" className="tombol-utama mt-5 w-full">
              Lanjut ke checkout <IkonPanahKanan ukuran={18} />
            </Link>
            <Link href="/produk" className="tombol-teks mt-2 w-full justify-center">
              Tambah produk lain
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

"use server";

import { ambilProdukUntukKeranjang } from "@/db/queries";
import { hapusDariKeranjang, jumlahItem, rekonsiliasiKeranjang, tambahKeKeranjang, ubahJumlah } from "@/lib/cart";
import { bacaKeranjang, simpanKeranjang } from "@/lib/cart-cookie";
import { formKeObjek, skemaAksiKeranjang } from "@/lib/validation";

export type HasilKeranjang = {
  ok: boolean;
  pesan: string;
  waktu: number;
  /** Data untuk keranjang mini (hanya saat berhasil). */
  mini?: { nama: string; gambar: string; jumlahDitambah: number; jumlahItem: number; subtotal: number };
} | null;

const hasil = (ok: boolean, pesan: string, mini?: NonNullable<HasilKeranjang>["mini"]): HasilKeranjang => ({
  ok,
  pesan,
  waktu: Date.now(),
  mini,
});

export async function tambahKeKeranjangAction(_sebelum: HasilKeranjang, formData: FormData): Promise<HasilKeranjang> {
  const data = skemaAksiKeranjang.safeParse(formKeObjek(formData));
  if (!data.success || data.data.quantity < 1) return hasil(false, "Jumlah tidak valid.");
  const { productId, quantity } = data.data;

  const produk = ambilProdukUntukKeranjang([productId]).get(productId);
  if (!produk || !produk.isActive) return hasil(false, "Produk tidak ditemukan.");
  if (produk.stock <= 0) return hasil(false, "Maaf, stok produk ini sedang habis.");

  const keranjang = await bacaKeranjang();
  const sebelum = keranjang.find((b) => b.productId === productId)?.quantity ?? 0;
  const baru = tambahKeKeranjang(keranjang, productId, quantity, produk.stock);
  const sesudah = baru.find((b) => b.productId === productId)?.quantity ?? 0;
  if (sesudah <= sebelum) {
    return hasil(
      false,
      sebelum >= produk.stock
        ? `Jumlah di keranjang sudah sama dengan stok tersedia (${produk.stock}).`
        : "Keranjang sudah penuh. Selesaikan atau kurangi isi keranjang dulu.",
    );
  }
  await simpanKeranjang(baru);
  const ditambah = sesudah - sebelum;
  const ringkasan = rekonsiliasiKeranjang(baru, ambilProdukUntukKeranjang(baru.map((b) => b.productId)));
  return hasil(
    true,
    ditambah < quantity
      ? `${ditambah} ${produk.name} ditambahkan (dibatasi stok). Isi keranjang: ${jumlahItem(baru)} barang.`
      : `${produk.name} ditambahkan. Isi keranjang: ${jumlahItem(baru)} barang.`,
    {
      nama: produk.name,
      gambar: produk.imagePath,
      jumlahDitambah: ditambah,
      jumlahItem: jumlahItem(ringkasan.keranjang),
      subtotal: ringkasan.subtotal,
    },
  );
}

export async function ubahJumlahAction(formData: FormData): Promise<void> {
  const data = skemaAksiKeranjang.safeParse(formKeObjek(formData));
  if (!data.success) return;
  const { productId, quantity } = data.data;
  const produk = ambilProdukUntukKeranjang([productId]).get(productId);
  const keranjang = await bacaKeranjang();
  const baru = produk && produk.isActive ? ubahJumlah(keranjang, productId, quantity, produk.stock) : hapusDariKeranjang(keranjang, productId);
  await simpanKeranjang(baru);
}

export async function hapusItemAction(formData: FormData): Promise<void> {
  const data = skemaAksiKeranjang.pick({ productId: true }).safeParse(formKeObjek(formData));
  if (!data.success) return;
  await simpanKeranjang(hapusDariKeranjang(await bacaKeranjang(), data.data.productId));
}

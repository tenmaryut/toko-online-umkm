"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { buatPesanan, GalatPesanan, ubahStatusPesanan } from "@/db/orders";
import { ambilProdukUntukKeranjang } from "@/db/queries";
import { rekonsiliasiKeranjang } from "@/lib/cart";
import { bacaKeranjang, simpanKeranjang } from "@/lib/cart-cookie";
import { buatRateLimiter, formatTunggu } from "@/lib/rate-limit";
import { ambilSesi } from "@/lib/session";
import { formKeObjek, galatPerKolom, skemaCheckout, skemaKodePesanan } from "@/lib/validation";
import type { HasilForm } from "./auth";

const batasCheckout = buatRateLimiter({ batas: 10, jendelaMs: 10 * 60_000 });

export async function buatPesananAction(_sebelum: HasilForm, formData: FormData): Promise<HasilForm> {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/masuk?kembali=/checkout");

  const data = formKeObjek(formData);
  if (data.website) return { pesan: "Permintaan tidak dapat diproses.", nilai: data };

  const hasil = skemaCheckout.safeParse(data);
  if (!hasil.success) return { galat: galatPerKolom(hasil.error), nilai: data };

  const cek = batasCheckout.cek(sesi.user.id);
  if (!cek.ok) return { pesan: `Terlalu banyak pesanan dalam waktu singkat. Coba lagi dalam ${formatTunggu(cek.cobaLagiDalamMs)}.`, nilai: data };

  // Pastikan isi keranjang masih sesuai stok sebelum membuat pesanan.
  const keranjang = await bacaKeranjang();
  const rekon = rekonsiliasiKeranjang(keranjang, ambilProdukUntukKeranjang(keranjang.map((b) => b.productId)));
  if (rekon.baris.length === 0) return { pesan: "Keranjang kosong atau semua produknya sudah tidak tersedia.", nilai: data };
  if (rekon.masalah.length > 0) {
    await simpanKeranjang(rekon.keranjang);
    return { pesan: "Stok beberapa produk berubah. Keranjang sudah disesuaikan; periksa ringkasan lalu kirim lagi.", nilai: data };
  }

  let kode: string;
  try {
    kode = buatPesanan(getDb(), { userId: sesi.user.id, keranjang: rekon.keranjang, data: hasil.data }).code;
  } catch (err) {
    if (err instanceof GalatPesanan) return { pesan: err.message, nilai: data };
    throw err;
  }
  await simpanKeranjang([]);
  redirect(`/akun/pesanan/${kode}?baru=1`);
}

async function ubahOlehPelanggan(formData: FormData, ke: "dibayar" | "dibatalkan", catatan: string) {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/masuk?kembali=/akun/pesanan");
  const kode = skemaKodePesanan.safeParse(formData.get("code"));
  if (!kode.success) return;
  let pesan: string = ke;
  try {
    ubahStatusPesanan(getDb(), { code: kode.data, ke, pelaku: "pelanggan", userId: sesi.user.id, catatan });
  } catch (err) {
    if (!(err instanceof GalatPesanan)) throw err;
    pesan = "gagal";
  }
  revalidatePath(`/akun/pesanan/${kode.data}`);
  redirect(`/akun/pesanan/${kode.data}?pesan=${pesan}`);
}

export async function bayarSimulasiAction(formData: FormData): Promise<void> {
  await ubahOlehPelanggan(formData, "dibayar", "Pembayaran simulasi berhasil");
}

export async function batalkanPesananAction(formData: FormData): Promise<void> {
  await ubahOlehPelanggan(formData, "dibatalkan", "Dibatalkan oleh pelanggan");
}

export async function rapikanKeranjangAction(): Promise<void> {
  const keranjang = await bacaKeranjang();
  const rekon = rekonsiliasiKeranjang(keranjang, ambilProdukUntukKeranjang(keranjang.map((b) => b.productId)));
  await simpanKeranjang(rekon.keranjang);
}

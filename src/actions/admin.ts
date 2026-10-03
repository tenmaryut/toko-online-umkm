"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { GalatPesanan, ubahStatusPesanan } from "@/db/orders";
import { categories, orderItems, products } from "@/db/schema";
import { buatRateLimiter, formatTunggu } from "@/lib/rate-limit";
import { pastikanAdmin } from "@/lib/session";
import { buatSlug } from "@/lib/slug";
import { hapusGambarUnggahan, simpanGambarProduk } from "@/lib/upload";
import { formKeObjek, galatPerKolom, skemaIdAngka, skemaKategori, skemaProduk, skemaUbahStatus } from "@/lib/validation";
import type { HasilForm } from "./auth";

const GAMBAR_POLOS = "/images/produk-polos.svg";

// Admin demo memakai kredensial publik; batasi laju perubahan supaya tidak disalahgunakan.
const batasUbah = buatRateLimiter({ batas: 60, jendelaMs: 10 * 60_000 });
const batasUnggah = buatRateLimiter({ batas: 15, jendelaMs: 60 * 60_000 });

async function adminDenganBatas() {
  const sesi = await pastikanAdmin();
  const cek = batasUbah.cek(sesi.user.id);
  return { sesi, cek };
}

// ---------------- Produk ----------------

export async function simpanProdukAction(_sebelum: HasilForm, formData: FormData): Promise<HasilForm> {
  const { sesi, cek } = await adminDenganBatas();
  const data = formKeObjek(formData);
  if (!cek.ok) return { pesan: `Terlalu banyak perubahan. Coba lagi dalam ${formatTunggu(cek.cobaLagiDalamMs)}.`, nilai: data };

  const hasil = skemaProduk.safeParse(data);
  if (!hasil.success) return { galat: galatPerKolom(hasil.error), nilai: data };
  const id = data.id ? skemaIdAngka.safeParse(data.id) : null;
  if (id && !id.success) return { pesan: "Produk tidak valid.", nilai: data };

  const db = getDb();
  const produkLama = id?.success ? db.select().from(products).where(eq(products.id, id.data)).get() : undefined;
  if (id?.success && !produkLama) return { pesan: "Produk tidak ditemukan.", nilai: data };

  const slug = hasil.data.slug ?? buatSlug(hasil.data.name);
  if (!slug) return { galat: { slug: "Slug tidak bisa dibuat dari nama ini; isi slug manual." }, nilai: data };
  const bentrok = db
    .select({ id: products.id })
    .from(products)
    .where(produkLama ? and(eq(products.slug, slug), ne(products.id, produkLama.id)) : eq(products.slug, slug))
    .get();
  if (bentrok) return { galat: { slug: "Slug sudah dipakai produk lain." }, nilai: data };
  if (!db.select({ id: categories.id }).from(categories).where(eq(categories.id, hasil.data.categoryId)).get()) {
    return { galat: { categoryId: "Kategori tidak ditemukan." }, nilai: data };
  }

  let imagePath = produkLama?.imagePath ?? GAMBAR_POLOS;
  const berkas = formData.get("gambar");
  if (berkas instanceof File && berkas.size > 0) {
    const cekUnggah = batasUnggah.cek(sesi.user.id);
    if (!cekUnggah.ok) return { pesan: `Batas unggah gambar tercapai. Coba lagi dalam ${formatTunggu(cekUnggah.cobaLagiDalamMs)}.`, nilai: data };
    const unggah = await simpanGambarProduk(berkas);
    if (!unggah.ok) return { galat: { gambar: unggah.pesan }, nilai: data };
    imagePath = unggah.path;
  }

  const nilai = {
    name: hasil.data.name,
    slug,
    categoryId: hasil.data.categoryId,
    price: hasil.data.price,
    stock: hasil.data.stock,
    weightGrams: hasil.data.weightGrams,
    description: hasil.data.description,
    isActive: hasil.data.isActive,
    isFeatured: hasil.data.isFeatured,
    imagePath,
  };
  if (produkLama) {
    db.update(products).set(nilai).where(eq(products.id, produkLama.id)).run();
    if (produkLama.imagePath !== imagePath) await hapusGambarUnggahan(produkLama.imagePath);
  } else {
    db.insert(products).values(nilai).run();
  }
  revalidatePath("/", "layout");
  redirect(`/admin/produk?pesan=${produkLama ? "diperbarui" : "ditambahkan"}`);
}

export async function aktifkanProdukAction(formData: FormData): Promise<void> {
  const { cek } = await adminDenganBatas();
  if (!cek.ok) return;
  const id = skemaIdAngka.safeParse(formData.get("id"));
  if (!id.success) return;
  getDb()
    .update(products)
    .set({ isActive: sql`not ${products.isActive}` })
    .where(eq(products.id, id.data))
    .run();
  revalidatePath("/", "layout");
}

export async function hapusProdukAction(formData: FormData): Promise<void> {
  const { cek } = await adminDenganBatas();
  if (!cek.ok) redirect("/admin/produk?pesan=terlalu-cepat");
  const id = skemaIdAngka.safeParse(formData.get("id"));
  if (!id.success) return;
  const db = getDb();
  const produk = db.select().from(products).where(eq(products.id, id.data)).get();
  if (!produk) redirect("/admin/produk");
  const pernahDipesan = db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, produk.id)).get();
  if (pernahDipesan) {
    // Produk yang ada di riwayat pesanan diarsipkan, bukan dihapus.
    db.update(products).set({ isActive: false }).where(eq(products.id, produk.id)).run();
    revalidatePath("/", "layout");
    redirect("/admin/produk?pesan=diarsipkan");
  }
  db.delete(products).where(eq(products.id, produk.id)).run();
  await hapusGambarUnggahan(produk.imagePath);
  revalidatePath("/", "layout");
  redirect("/admin/produk?pesan=dihapus");
}

// ---------------- Kategori ----------------

export async function simpanKategoriAction(_sebelum: HasilForm, formData: FormData): Promise<HasilForm> {
  const { cek } = await adminDenganBatas();
  const data = formKeObjek(formData);
  if (!cek.ok) return { pesan: `Terlalu banyak perubahan. Coba lagi dalam ${formatTunggu(cek.cobaLagiDalamMs)}.`, nilai: data };
  const hasil = skemaKategori.safeParse(data);
  if (!hasil.success) return { galat: galatPerKolom(hasil.error), nilai: data };
  const id = data.id ? skemaIdAngka.safeParse(data.id) : null;
  if (id && !id.success) return { pesan: "Kategori tidak valid.", nilai: data };

  const db = getDb();
  const slug = hasil.data.slug ?? buatSlug(hasil.data.name, 60);
  if (!slug) return { galat: { slug: "Isi slug manual." }, nilai: data };
  const bentrok = db
    .select({ id: categories.id })
    .from(categories)
    .where(id?.success ? and(eq(categories.slug, slug), ne(categories.id, id.data)) : eq(categories.slug, slug))
    .get();
  if (bentrok) return { galat: { slug: "Slug sudah dipakai kategori lain." }, nilai: data };

  if (id?.success) {
    const hasilUbah = db
      .update(categories)
      .set({ name: hasil.data.name, slug, description: hasil.data.description })
      .where(eq(categories.id, id.data))
      .run();
    if (hasilUbah.changes === 0) return { pesan: "Kategori tidak ditemukan.", nilai: data };
  } else {
    const urutan = db.select({ n: sql<number>`coalesce(max(${categories.sortOrder}), 0) + 1` }).from(categories).get()?.n ?? 0;
    db.insert(categories).values({ name: hasil.data.name, slug, description: hasil.data.description, sortOrder: urutan }).run();
  }
  revalidatePath("/", "layout");
  return { pesan: id?.success ? "Kategori diperbarui." : "Kategori ditambahkan.", waktu: Date.now() };
}

export async function hapusKategoriAction(formData: FormData): Promise<void> {
  const { cek } = await adminDenganBatas();
  if (!cek.ok) return;
  const id = skemaIdAngka.safeParse(formData.get("id"));
  if (!id.success) return;
  const db = getDb();
  const dipakai = db.select({ id: products.id }).from(products).where(eq(products.categoryId, id.data)).get();
  if (dipakai) redirect("/admin/kategori?pesan=masih-dipakai");
  db.delete(categories).where(eq(categories.id, id.data)).run();
  revalidatePath("/", "layout");
  redirect("/admin/kategori?pesan=dihapus");
}

// ---------------- Pesanan ----------------

export async function ubahStatusPesananAction(formData: FormData): Promise<void> {
  const { cek } = await adminDenganBatas();
  const hasil = skemaUbahStatus.safeParse(formKeObjek(formData));
  if (!hasil.success) return;
  if (!cek.ok) redirect(`/admin/pesanan/${hasil.data.code}?pesan=terlalu-cepat`);
  try {
    ubahStatusPesanan(getDb(), {
      code: hasil.data.code,
      ke: hasil.data.status,
      pelaku: "admin",
      catatan: hasil.data.note || (hasil.data.status === "dibatalkan" ? "Dibatalkan oleh admin" : ""),
    });
  } catch (err) {
    if (err instanceof GalatPesanan) redirect(`/admin/pesanan/${hasil.data.code}?pesan=tidak-diizinkan`);
    throw err;
  }
  revalidatePath(`/admin/pesanan/${hasil.data.code}`);
  revalidatePath("/admin");
  redirect(`/admin/pesanan/${hasil.data.code}?pesan=status-${hasil.data.status}`);
}

import "server-only";
import { and, asc, count, desc, eq, gte, inArray, lte, ne, sql, sum } from "drizzle-orm";
import type { InfoProduk } from "@/lib/cart";
import { kunciHariWIB } from "@/lib/format";
import { STATUS_TERBAYAR, type StatusPesanan } from "@/lib/order-status";
import type { QueryKatalog } from "@/lib/validation";
import { getDb } from "./index";
import { categories, orders, orderStatusHistory, products, user } from "./schema";

export const PRODUK_PER_HALAMAN = 12;
const HARI = 24 * 60 * 60 * 1000;

const kolomKartu = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  price: products.price,
  stock: products.stock,
  imagePath: products.imagePath,
  soldCount: products.soldCount,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export type KartuProduk = {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  imagePath: string;
  soldCount: number;
  categoryName: string;
  categorySlug: string;
};

// Catatan: subquery berkorelasi ditulis dengan nama tabel eksplisit karena Drizzle
// menulis kolom tanpa nama tabel pada select satu tabel ("category_id" = "id").

// ---------------- Katalog ----------------

export function ambilKategori() {
  return getDb()
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      jumlahProduk: sql<number>`(select count(*) from products p where p.category_id = "categories"."id" and p.is_active = 1)`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();
}

export function ambilKategoriBySlug(slug: string) {
  return getDb().select().from(categories).where(eq(categories.slug, slug)).get();
}

/** Escape karakter khusus LIKE agar "%" dan "_" dari pengguna dicari apa adanya. */
function polaLike(teks: string): string {
  return `%${teks.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function cariProduk(q: QueryKatalog) {
  const db = getDb();
  const syarat = [eq(products.isActive, true)];
  if (q.q) {
    const pola = polaLike(q.q);
    syarat.push(
      sql`(${products.name} LIKE ${pola} ESCAPE '\\' OR ${products.description} LIKE ${pola} ESCAPE '\\' OR ${categories.name} LIKE ${pola} ESCAPE '\\')`,
    );
  }
  if (q.kategori) syarat.push(eq(categories.slug, q.kategori));
  if (q.min !== undefined) syarat.push(gte(products.price, q.min));
  if (q.max !== undefined) syarat.push(lte(products.price, q.max));
  if (q.tersedia) syarat.push(sql`${products.stock} > 0`);
  const where = and(...syarat);

  const urutan = {
    terbaru: [desc(products.createdAt), desc(products.id)],
    terlaris: [desc(products.soldCount), asc(products.name)],
    "harga-terendah": [asc(products.price), asc(products.name)],
    "harga-tertinggi": [desc(products.price), asc(products.name)],
    nama: [asc(products.name)],
  }[q.urut];

  const total =
    db.select({ n: count() }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(where).get()?.n ?? 0;
  const jumlahHalaman = Math.max(1, Math.ceil(total / PRODUK_PER_HALAMAN));
  const halaman = Math.min(q.hal, jumlahHalaman);
  const items: KartuProduk[] = db
    .select(kolomKartu)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(...urutan)
    .limit(PRODUK_PER_HALAMAN)
    .offset((halaman - 1) * PRODUK_PER_HALAMAN)
    .all();
  return { items, total, halaman, jumlahHalaman };
}

export function ambilProdukUnggulan(batas = 8): KartuProduk[] {
  return getDb()
    .select(kolomKartu)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.soldCount))
    .limit(batas)
    .all();
}

export function ambilProdukTerlaris(batas = 4): KartuProduk[] {
  return getDb()
    .select(kolomKartu)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), sql`${products.stock} > 0`))
    .orderBy(desc(products.soldCount))
    .limit(batas)
    .all();
}

export function ambilProdukBySlug(slug: string) {
  return getDb()
    .select({
      ...kolomKartu,
      description: products.description,
      weightGrams: products.weightGrams,
      categoryId: products.categoryId,
      isActive: products.isActive,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .get();
}

export function ambilProdukTerkait(categoryId: number, kecualiId: number, batas = 4): KartuProduk[] {
  return getDb()
    .select(kolomKartu)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, categoryId), ne(products.id, kecualiId), eq(products.isActive, true)))
    .orderBy(desc(products.soldCount))
    .limit(batas)
    .all();
}

export function ambilProdukUntukKeranjang(ids: number[]): Map<number, InfoProduk> {
  if (ids.length === 0) return new Map();
  const daftar = getDb()
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      isActive: products.isActive,
      imagePath: products.imagePath,
    })
    .from(products)
    .where(inArray(products.id, ids))
    .all();
  return new Map(daftar.map((p) => [p.id, p]));
}

export function semuaProdukUntukSitemap() {
  return getDb()
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isActive, true))
    .all();
}

// ---------------- Pesanan pelanggan ----------------

export function ambilPesananPengguna(userId: string) {
  return getDb().query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });
}

export function ambilPesananByKode(code: string) {
  return getDb().query.orders.findFirst({
    where: eq(orders.code, code),
    with: {
      items: true,
      history: { orderBy: [asc(orderStatusHistory.createdAt), asc(orderStatusHistory.id)] },
      user: { columns: { id: true, name: true, email: true, isDemo: true } },
    },
  });
}

/** Alamat dari pesanan terakhir, untuk mengisi otomatis form checkout. */
export function alamatTerakhir(userId: string) {
  return getDb()
    .select({
      recipientName: orders.recipientName,
      phone: orders.phone,
      addressLine: orders.addressLine,
      city: orders.city,
      province: orders.province,
      postalCode: orders.postalCode,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(1)
    .get();
}

// ---------------- Admin ----------------

export function ringkasanDashboard(sekarang = new Date()) {
  const db = getDb();
  const sejak30 = new Date(sekarang.getTime() - 30 * HARI);
  const terbayar = inArray(orders.status, [...STATUS_TERBAYAR]);
  const penjualan = db
    .select({ pendapatan: sum(orders.total), jumlah: count() })
    .from(orders)
    .where(and(terbayar, gte(orders.createdAt, sejak30)))
    .get();
  const perluDiproses =
    db.select({ n: count() }).from(orders).where(inArray(orders.status, ["dibayar", "dikemas"])).get()?.n ?? 0;
  const menungguBayar =
    db.select({ n: count() }).from(orders).where(eq(orders.status, "menunggu_pembayaran")).get()?.n ?? 0;
  const pelangganBaru =
    db.select({ n: count() }).from(user).where(and(eq(user.role, "customer"), gte(user.createdAt, sejak30))).get()?.n ?? 0;
  const pendapatan = Number(penjualan?.pendapatan ?? 0);
  const jumlah = penjualan?.jumlah ?? 0;
  return {
    pendapatan30Hari: pendapatan,
    pesanan30Hari: jumlah,
    rataRata: jumlah > 0 ? Math.round(pendapatan / jumlah) : 0,
    pelangganBaru,
    perluDiproses,
    menungguBayar,
  };
}

/** Pendapatan per hari (WIB) untuk `hari` hari terakhir, termasuk hari tanpa penjualan. */
export function penjualanHarian(hari = 14, sekarang = new Date()) {
  const sejak = new Date(sekarang.getTime() - hari * HARI);
  const daftar = getDb()
    .select({ total: orders.total, createdAt: orders.createdAt })
    .from(orders)
    .where(and(inArray(orders.status, [...STATUS_TERBAYAR]), gte(orders.createdAt, sejak)))
    .all();
  const peta = new Map<string, { total: number; jumlah: number }>();
  for (let i = hari - 1; i >= 0; i--) {
    peta.set(kunciHariWIB(new Date(sekarang.getTime() - i * HARI)), { total: 0, jumlah: 0 });
  }
  for (const o of daftar) {
    const kunci = kunciHariWIB(o.createdAt);
    const isi = peta.get(kunci);
    if (isi) {
      isi.total += o.total;
      isi.jumlah += 1;
    }
  }
  return [...peta.entries()].map(([tanggal, v]) => ({ tanggal, ...v }));
}

export function stokMenipis(batas = 5) {
  return getDb()
    .select({ id: products.id, name: products.name, slug: products.slug, stock: products.stock })
    .from(products)
    .where(and(eq(products.isActive, true), lte(products.stock, batas)))
    .orderBy(asc(products.stock), asc(products.name))
    .all();
}

export const PESANAN_PER_HALAMAN = 20;

export function daftarPesananAdmin(filter: { status?: StatusPesanan; q?: string; hal: number }) {
  const db = getDb();
  const syarat = [];
  if (filter.status) syarat.push(eq(orders.status, filter.status));
  if (filter.q) syarat.push(sql`${orders.code} LIKE ${polaLike(filter.q)} ESCAPE '\\'`);
  const where = syarat.length ? and(...syarat) : undefined;
  const total = db.select({ n: count() }).from(orders).where(where).get()?.n ?? 0;
  const jumlahHalaman = Math.max(1, Math.ceil(total / PESANAN_PER_HALAMAN));
  const halaman = Math.min(filter.hal, jumlahHalaman);
  const items = db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      recipientName: orders.recipientName,
      city: orders.city,
      province: orders.province,
      customerName: user.name,
      customerIsDemo: user.isDemo,
      jumlahItem: sql<number>`(select coalesce(sum(oi.quantity), 0) from order_items oi where oi.order_id = "orders"."id")`,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(PESANAN_PER_HALAMAN)
    .offset((halaman - 1) * PESANAN_PER_HALAMAN)
    .all();
  return { items, total, halaman, jumlahHalaman };
}

export function jumlahPesananPerStatus() {
  const daftar = getDb().select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status).all();
  return new Map(daftar.map((d) => [d.status, d.n]));
}

export function pesananTerbaru(batas = 6) {
  return getDb()
    .select({
      code: orders.code,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      customerName: user.name,
      customerIsDemo: user.isDemo,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(batas)
    .all();
}

export function daftarPelanggan() {
  return getDb()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isDemo: user.isDemo,
      createdAt: user.createdAt,
      jumlahPesanan: sql<number>`(select count(*) from orders o where o.user_id = "user"."id")`,
      totalBelanja: sql<number>`(select coalesce(sum(o.total), 0) from orders o where o.user_id = "user"."id" and o.status in ('dibayar','dikemas','dikirim','selesai'))`,
    })
    .from(user)
    .where(eq(user.role, "customer"))
    .orderBy(desc(user.createdAt))
    .all();
}

export function daftarProdukAdmin() {
  return getDb()
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      stock: products.stock,
      imagePath: products.imagePath,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      soldCount: products.soldCount,
      categoryName: categories.name,
      dipesan: sql<number>`(select count(*) from order_items oi where oi.product_id = "products"."id")`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(products.name))
    .all();
}

export function ambilProdukAdmin(id: number) {
  return getDb().select().from(products).where(eq(products.id, id)).get();
}

export function daftarKategoriAdmin() {
  return getDb()
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      sortOrder: categories.sortOrder,
      jumlahProduk: sql<number>`(select count(*) from products p where p.category_id = "categories"."id")`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();
}

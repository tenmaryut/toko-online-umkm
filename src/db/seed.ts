import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq, ne, or, sql } from "drizzle-orm";
import { AKUN_DEMO } from "../lib/site";
import type { StatusPesanan } from "../lib/order-status";
import { METODE_PEMBAYARAN } from "../lib/order-status";
import { LAYANAN_IDS, TARIF, zonaUntukProvinsi } from "../lib/shipping";
import type { DB } from "./client";
import { DATA_KATEGORI, DATA_PRODUK, PELANGGAN_CONTOH } from "./seed-data";
import {
  account,
  categories,
  orderItems,
  orders,
  orderStatusHistory,
  products,
  session,
  user,
  verification,
} from "./schema";

const HARI = 24 * 60 * 60 * 1000;
const JAM = 60 * 60 * 1000;

/** PRNG deterministik (mulberry32) supaya data demo sama setiap kali direset. */
function buatAcak(benih: number) {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALFABET_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Kode pesanan: LK + tanggal WIB (yymmdd) + 4 karakter acak, mis. LK261002-7KQ3. */
export function buatKodePesanan(tanggal: Date, acak: () => number = Math.random): string {
  const wib = new Date(tanggal.getTime() + 7 * JAM);
  const yy = String(wib.getUTCFullYear() % 100).padStart(2, "0");
  const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(wib.getUTCDate()).padStart(2, "0");
  let akhir = "";
  for (let i = 0; i < 4; i++) akhir += ALFABET_KODE[Math.floor(acak() * ALFABET_KODE.length)];
  return `LK${yy}${mm}${dd}-${akhir}`;
}

type BarisUser = typeof user.$inferInsert;

/**
 * Mengosongkan data toko dan akun non-admin, lalu mengisi ulang data demo.
 * Admin asli (role admin, bukan akun demo) dan sesinya dipertahankan.
 */
export async function isiUlangDataDemo(db: DB, opsi: { sekarang?: Date } = {}) {
  const sekarang = opsi.sekarang ?? new Date();
  const t0 = sekarang.getTime();
  const acak = buatAcak(20261002);
  const pilih = <T,>(daftar: readonly T[]): T => daftar[Math.floor(acak() * daftar.length)] as T;

  // Hash scrypt dibuat sebelum transaksi (transaksi better-sqlite3 harus sinkron).
  const [hashPelanggan, hashAdmin, hashContoh] = await Promise.all([
    hashPassword(AKUN_DEMO.pelanggan.password),
    hashPassword(AKUN_DEMO.admin.password),
    // Pelanggan contoh tidak dimaksudkan untuk login; kata sandinya acak dan tidak disimpan.
    hashPassword(randomBytes(24).toString("base64url")),
  ]);

  db.transaction((tx) => {
    // 1. Kosongkan data toko.
    tx.delete(orderStatusHistory).run();
    tx.delete(orderItems).run();
    tx.delete(orders).run();
    tx.delete(products).run();
    tx.delete(categories).run();
    // 2. Hapus semua akun kecuali admin asli. Sesi & akun kredensial ikut terhapus (cascade).
    tx.delete(user)
      .where(or(eq(user.isDemo, true), ne(user.role, "admin")))
      .run();
    tx.delete(verification).run();
    tx.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('categories','products','orders','order_items','order_status_history')`);

    // 3. Kategori dan produk.
    const idKategori = new Map<string, number>();
    DATA_KATEGORI.forEach((k, i) => {
      const baris = tx
        .insert(categories)
        .values({ slug: k.slug, name: k.name, description: k.description, sortOrder: i, createdAt: new Date(t0 - 60 * HARI) })
        .returning({ id: categories.id })
        .get();
      idKategori.set(k.slug, baris.id);
    });

    const produkTersimpan = DATA_PRODUK.map((p, i) => {
      const dibuat = new Date(t0 - (60 - i) * HARI);
      const baris = tx
        .insert(products)
        .values({
          slug: p.slug,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          weightGrams: p.weightGrams,
          categoryId: idKategori.get(p.kategori) as number,
          imagePath: `/images/produk/${p.slug}.svg`,
          isActive: true,
          isFeatured: p.isFeatured ?? false,
          createdAt: dibuat,
          updatedAt: dibuat,
        })
        .returning({ id: products.id })
        .get();
      return { ...p, id: baris.id };
    });

    // 4. Akun demo (tampil di halaman masuk) dan pelanggan contoh.
    const buatAkun = (data: BarisUser, hash: string) => {
      tx.insert(user).values(data).run();
      tx.insert(account)
        .values({ id: randomUUID(), accountId: data.id, providerId: "credential", userId: data.id, password: hash })
        .run();
    };
    const idPelangganDemo = randomUUID();
    buatAkun(
      {
        id: idPelangganDemo,
        name: AKUN_DEMO.pelanggan.nama,
        email: AKUN_DEMO.pelanggan.email,
        emailVerified: true,
        role: "customer",
        isDemo: true,
        createdAt: new Date(t0 - 45 * HARI),
      },
      hashPelanggan,
    );
    buatAkun(
      {
        id: randomUUID(),
        name: AKUN_DEMO.admin.nama,
        email: AKUN_DEMO.admin.email,
        emailVerified: true,
        role: "admin",
        isDemo: true,
        createdAt: new Date(t0 - 90 * HARI),
      },
      hashAdmin,
    );
    const pelanggan = [
      { id: idPelangganDemo, nama: AKUN_DEMO.pelanggan.nama, kota: "Kota Contoh", provinsi: "Jawa Tengah" },
      ...PELANGGAN_CONTOH.map((p, i) => {
        const id = randomUUID();
        buatAkun(
          {
            id,
            name: p.nama,
            email: p.email,
            emailVerified: true,
            role: "customer",
            isDemo: true,
            createdAt: new Date(t0 - (40 - i * 4) * HARI),
          },
          hashContoh,
        );
        return { id, nama: p.nama, kota: p.kota, provinsi: p.provinsi };
      }),
    ];

    // 5. Pesanan contoh selama 30 hari terakhir, untuk grafik dan riwayat.
    const tersedia = produkTersimpan.filter((p) => p.stock > 0);
    const terjual = new Map<number, number>();
    const kodeTerpakai = new Set<string>();
    const ALUR: StatusPesanan[] = ["menunggu_pembayaran", "dibayar", "dikemas", "dikirim", "selesai"];

    const jumlahPesanan = 52;
    for (let n = 0; n < jumlahPesanan; n++) {
      // Pesanan lebih rapat di hari-hari terakhir; dua pesanan pertama milik Pelanggan Demo.
      const hariLalu = n < 2 ? [9, 3][n]! : Math.floor(Math.pow(acak(), 1.15) * 30);
      const dibuat = new Date(t0 - hariLalu * HARI - Math.floor(acak() * 10 * JAM) - JAM);
      const pemilik = n < 2 ? pelanggan[0]! : pilih(pelanggan.slice(1));

      let akhir: StatusPesanan;
      if (n === 0) akhir = "selesai";
      else if (n === 1) akhir = "dikirim";
      else if (hariLalu >= 8) akhir = acak() < 0.9 ? "selesai" : "dibatalkan";
      else if (hariLalu >= 4) akhir = pilih(["dikirim", "selesai", "selesai"] as const);
      else if (hariLalu >= 2) akhir = pilih(["dikemas", "dikirim", "dibayar"] as const);
      else akhir = pilih(["menunggu_pembayaran", "dibayar", "dibayar", "dikemas"] as const);

      const jumlahJenis = 1 + Math.floor(acak() * 3);
      const dipilih = new Map<number, (typeof tersedia)[number]>();
      while (dipilih.size < jumlahJenis) {
        const p = pilih(tersedia);
        dipilih.set(p.id, p);
      }
      const item = [...dipilih.values()].map((p) => ({ p, qty: 1 + Math.floor(acak() * (p.price > 60_000 ? 2 : 3)) }));
      const subtotal = item.reduce((t, i) => t + i.p.price * i.qty, 0);
      const zona = zonaUntukProvinsi(pemilik.provinsi) ?? "zona-1";
      const layanan = pilih(LAYANAN_IDS);
      const ongkir = TARIF[zona][layanan].biaya;

      let kode = buatKodePesanan(dibuat, acak);
      while (kodeTerpakai.has(kode)) kode = buatKodePesanan(dibuat, acak);
      kodeTerpakai.add(kode);

      // Riwayat status: tiap langkah beberapa jam setelah langkah sebelumnya, tidak melewati "sekarang".
      const langkah: { status: StatusPesanan; waktu: Date }[] = [];
      let waktu = dibuat.getTime();
      const urutan = akhir === "dibatalkan" ? (["menunggu_pembayaran", "dibatalkan"] as StatusPesanan[]) : ALUR.slice(0, ALUR.indexOf(akhir) + 1);
      for (const status of urutan) {
        langkah.push({ status, waktu: new Date(Math.min(waktu, t0 - 5 * 60 * 1000)) });
        waktu += (status === "menunggu_pembayaran" ? 0.5 : 10 + acak() * 14) * JAM;
      }
      const terakhir = langkah.at(-1)!.waktu;
      const dibayarPada = langkah.find((l) => l.status === "dibayar")?.waktu ?? null;

      const pesanan = tx
        .insert(orders)
        .values({
          code: kode,
          userId: pemilik.id,
          status: akhir,
          recipientName: pemilik.nama,
          phone: `08120000${String(10 + (n % 90)).padStart(4, "0")}`,
          addressLine: `Jl. Contoh Demo No. ${1 + Math.floor(acak() * 120)}`,
          city: pemilik.kota,
          province: pemilik.provinsi,
          postalCode: String(10000 + Math.floor(acak() * 89999)),
          shippingZone: zona,
          shippingService: layanan,
          shippingCost: ongkir,
          subtotal,
          total: subtotal + ongkir,
          paymentMethod: pilih(METODE_PEMBAYARAN),
          note: "",
          paidAt: dibayarPada,
          createdAt: dibuat,
          updatedAt: terakhir,
        })
        .returning({ id: orders.id })
        .get();

      for (const { p, qty } of item) {
        tx.insert(orderItems)
          .values({ orderId: pesanan.id, productId: p.id, productName: p.name, productSlug: p.slug, unitPrice: p.price, quantity: qty })
          .run();
        if (akhir !== "dibatalkan") terjual.set(p.id, (terjual.get(p.id) ?? 0) + qty);
      }
      for (const l of langkah) {
        tx.insert(orderStatusHistory)
          .values({
            orderId: pesanan.id,
            status: l.status,
            actor: l.status === "menunggu_pembayaran" || l.status === "dibayar" ? "pelanggan" : "admin",
            note: l.status === "menunggu_pembayaran" ? "Pesanan dibuat" : l.status === "dibayar" ? "Pembayaran simulasi berhasil" : "",
            createdAt: l.waktu,
          })
          .run();
      }
    }

    for (const [id, jumlah] of terjual) {
      tx.update(products).set({ soldCount: jumlah }).where(eq(products.id, id)).run();
    }
  });

  return {
    kategori: DATA_KATEGORI.length,
    produk: DATA_PRODUK.length,
    pelanggan: PELANGGAN_CONTOH.length + 1,
  };
}

/** True kalau database belum berisi data toko sama sekali (instalasi baru). */
export function databaseKosong(db: DB): boolean {
  const baris = db.select({ n: sql<number>`count(*)` }).from(categories).get();
  return (baris?.n ?? 0) === 0;
}

/** Menghapus sesi milik akun yang sudah tidak ada atau kedaluwarsa (bersih-bersih ringan). */
export function hapusSesiKedaluwarsa(db: DB, sekarang = new Date()) {
  db.delete(session).where(sql`${session.expiresAt} < ${sekarang.getTime()}`).run();
}


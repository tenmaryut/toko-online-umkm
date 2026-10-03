import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeEach, describe, expect, it } from "vitest";
import { bukaDatabase, type DB } from "@/db/client";
import { buatPesanan, GalatPesanan, ubahStatusPesanan } from "@/db/orders";
import { orders, orderStatusHistory, products, user } from "@/db/schema";
import { isiUlangDataDemo } from "@/db/seed";
import { AKUN_DEMO } from "@/lib/site";
import type { DataCheckout } from "@/lib/validation";

const alamat: DataCheckout = {
  recipientName: "Pelanggan Demo",
  phone: "081234567890",
  addressLine: "Jl. Contoh Demo No. 1",
  city: "Kota Contoh",
  province: "Jawa Tengah",
  postalCode: "50111",
  shippingService: "kilat",
  paymentMethod: "qris",
  note: "",
};

let db: DB;
let idPelanggan: string;

function produk(slug: string) {
  const p = db.select().from(products).where(eq(products.slug, slug)).get();
  if (!p) throw new Error(`produk ${slug} tidak ada`);
  return p;
}

beforeEach(async () => {
  db = bukaDatabase(":memory:").db;
  migrate(db, { migrationsFolder: "drizzle" });
  await isiUlangDataDemo(db);
  idPelanggan = db.select().from(user).where(eq(user.email, AKUN_DEMO.pelanggan.email)).get()!.id;
});

describe("pembuatan pesanan", () => {
  it("mengurangi stok, menghitung ongkir zona, dan mencatat riwayat", () => {
    const awal = produk("rempeyek-kacang"); // stok 3, Rp20.000
    const hasil = buatPesanan(db, {
      userId: idPelanggan,
      keranjang: [{ productId: awal.id, quantity: 2 }],
      data: alamat,
    });
    expect(hasil.code).toMatch(/^LK\d{6}-[A-Z0-9]{4}$/);
    expect(hasil.total).toBe(2 * 20_000 + 22_000); // Jawa Tengah = zona 1, kilat Rp22.000

    const sesudah = produk("rempeyek-kacang");
    expect(sesudah.stock).toBe(1);
    expect(sesudah.soldCount).toBe(awal.soldCount + 2);

    const pesanan = db.select().from(orders).where(eq(orders.code, hasil.code)).get()!;
    expect(pesanan.status).toBe("menunggu_pembayaran");
    expect(pesanan.shippingZone).toBe("zona-1");
    const riwayat = db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, pesanan.id)).all();
    expect(riwayat.map((r) => r.status)).toEqual(["menunggu_pembayaran"]);
  });

  it("menolak pesanan melebihi stok tanpa mengubah stok apa pun (rollback)", () => {
    const a = produk("rempeyek-kacang"); // stok 3
    const b = produk("kopi-arabika-lereng-pagi"); // stok 24
    expect(() =>
      buatPesanan(db, {
        userId: idPelanggan,
        keranjang: [
          { productId: b.id, quantity: 1 },
          { productId: a.id, quantity: 5 },
        ],
        data: alamat,
      }),
    ).toThrow(GalatPesanan);
    expect(produk("rempeyek-kacang").stock).toBe(3);
    expect(produk("kopi-arabika-lereng-pagi").stock).toBe(24);
  });

  it("menolak produk yang stoknya habis dan keranjang kosong", () => {
    const habis = produk("kopi-gula-aren-siap-seduh");
    expect(habis.stock).toBe(0);
    expect(() => buatPesanan(db, { userId: idPelanggan, keranjang: [{ productId: habis.id, quantity: 1 }], data: alamat })).toThrow(
      /habis/,
    );
    expect(() => buatPesanan(db, { userId: idPelanggan, keranjang: [], data: alamat })).toThrow(/kosong/);
  });
});

describe("perubahan status pesanan", () => {
  it("pembayaran simulasi lalu admin memproses sampai selesai", () => {
    const p = produk("teh-serai-jahe");
    const { code } = buatPesanan(db, { userId: idPelanggan, keranjang: [{ productId: p.id, quantity: 1 }], data: alamat });
    ubahStatusPesanan(db, { code, ke: "dibayar", pelaku: "pelanggan", userId: idPelanggan });
    for (const ke of ["dikemas", "dikirim", "selesai"] as const) {
      ubahStatusPesanan(db, { code, ke, pelaku: "admin" });
    }
    const pesanan = db.select().from(orders).where(eq(orders.code, code)).get()!;
    expect(pesanan.status).toBe("selesai");
    expect(pesanan.paidAt).toBeInstanceOf(Date);
    expect(() => ubahStatusPesanan(db, { code, ke: "dikirim", pelaku: "admin" })).toThrow(/tidak diizinkan/);
  });

  it("pembatalan oleh pelanggan mengembalikan stok", () => {
    const p = produk("saringan-kopi-kain-isi-2"); // stok 2
    const { code } = buatPesanan(db, { userId: idPelanggan, keranjang: [{ productId: p.id, quantity: 2 }], data: alamat });
    expect(produk("saringan-kopi-kain-isi-2").stock).toBe(0);
    ubahStatusPesanan(db, { code, ke: "dibatalkan", pelaku: "pelanggan", userId: idPelanggan });
    expect(produk("saringan-kopi-kain-isi-2").stock).toBe(2);
  });

  it("pelanggan tidak bisa mengubah pesanan milik orang lain", () => {
    const p = produk("teh-serai-jahe");
    const { code } = buatPesanan(db, { userId: idPelanggan, keranjang: [{ productId: p.id, quantity: 1 }], data: alamat });
    expect(() => ubahStatusPesanan(db, { code, ke: "dibatalkan", pelaku: "pelanggan", userId: "orang-lain" })).toThrow(
      /tidak ditemukan/,
    );
  });
});

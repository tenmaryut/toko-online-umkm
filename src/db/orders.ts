import { and, eq, gte, inArray, sql } from "drizzle-orm";
import type { Keranjang } from "../lib/cart";
import {
  bolehUbahStatus,
  kembalikanStokSaatBatal,
  type Pelaku,
  type StatusPesanan,
} from "../lib/order-status";
import { kutipOngkir } from "../lib/shipping";
import type { DataCheckout } from "../lib/validation";
import type { DB } from "./client";
import { orderItems, orders, orderStatusHistory, products } from "./schema";
import { buatKodePesanan } from "./seed";

/** Galat bisnis yang pesannya aman ditampilkan ke pengguna. */
export class GalatPesanan extends Error {}

/**
 * Membuat pesanan dalam satu transaksi: cek produk & stok, kurangi stok, simpan pesanan,
 * item, dan riwayat status. Harga dan ongkir dihitung ulang di server.
 */
export function buatPesanan(
  db: DB,
  input: { userId: string; keranjang: Keranjang; data: DataCheckout; sekarang?: Date },
): { code: string; total: number } {
  const sekarang = input.sekarang ?? new Date();
  return db.transaction(
    (tx) => {
      if (input.keranjang.length === 0) throw new GalatPesanan("Keranjang masih kosong.");
      const ids = input.keranjang.map((b) => b.productId);
      const daftar = tx.select().from(products).where(inArray(products.id, ids)).all();
      const peta = new Map(daftar.map((p) => [p.id, p]));

      const baris = input.keranjang.map((b) => {
        const p = peta.get(b.productId);
        if (!p || !p.isActive) throw new GalatPesanan("Ada produk di keranjang yang sudah tidak dijual.");
        if (p.stock < b.quantity) {
          throw new GalatPesanan(
            p.stock === 0 ? `Stok ${p.name} sudah habis.` : `Stok ${p.name} tinggal ${p.stock}. Ubah jumlahnya di keranjang.`,
          );
        }
        return { p, qty: b.quantity };
      });

      const subtotal = baris.reduce((t, b) => t + b.p.price * b.qty, 0);
      const ongkir = kutipOngkir(input.data.province, input.data.shippingService);

      for (const { p, qty } of baris) {
        const hasil = tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${qty}`, soldCount: sql`${products.soldCount} + ${qty}`, updatedAt: sekarang })
          .where(and(eq(products.id, p.id), gte(products.stock, qty)))
          .run();
        if (hasil.changes !== 1) throw new GalatPesanan(`Stok ${p.name} tidak mencukupi.`);
      }

      let code = buatKodePesanan(sekarang);
      while (tx.select({ id: orders.id }).from(orders).where(eq(orders.code, code)).get()) {
        code = buatKodePesanan(sekarang);
      }

      const pesanan = tx
        .insert(orders)
        .values({
          code,
          userId: input.userId,
          status: "menunggu_pembayaran",
          recipientName: input.data.recipientName,
          phone: input.data.phone,
          addressLine: input.data.addressLine,
          city: input.data.city,
          province: input.data.province,
          postalCode: input.data.postalCode,
          shippingZone: ongkir.zona,
          shippingService: ongkir.layanan,
          shippingCost: ongkir.biaya,
          subtotal,
          total: subtotal + ongkir.biaya,
          paymentMethod: input.data.paymentMethod,
          note: input.data.note,
          createdAt: sekarang,
          updatedAt: sekarang,
        })
        .returning({ id: orders.id })
        .get();

      tx.insert(orderItems)
        .values(
          baris.map(({ p, qty }) => ({
            orderId: pesanan.id,
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            unitPrice: p.price,
            quantity: qty,
          })),
        )
        .run();
      tx.insert(orderStatusHistory)
        .values({ orderId: pesanan.id, status: "menunggu_pembayaran", actor: "pelanggan", note: "Pesanan dibuat", createdAt: sekarang })
        .run();

      return { code, total: subtotal + ongkir.biaya };
    },
    { behavior: "immediate" },
  );
}

/**
 * Mengubah status pesanan sesuai aturan transisi. Pelanggan hanya boleh mengubah pesanannya
 * sendiri. Pembatalan sebelum dikirim mengembalikan stok.
 */
export function ubahStatusPesanan(
  db: DB,
  input: { code: string; ke: StatusPesanan; pelaku: Pelaku; userId?: string; catatan?: string; sekarang?: Date },
): { dari: StatusPesanan; ke: StatusPesanan } {
  const sekarang = input.sekarang ?? new Date();
  return db.transaction(
    (tx) => {
      const pesanan = tx.select().from(orders).where(eq(orders.code, input.code)).get();
      if (!pesanan) throw new GalatPesanan("Pesanan tidak ditemukan.");
      if (input.pelaku === "pelanggan" && pesanan.userId !== input.userId) {
        throw new GalatPesanan("Pesanan tidak ditemukan.");
      }
      const dari = pesanan.status;
      if (!bolehUbahStatus(dari, input.ke, input.pelaku)) {
        throw new GalatPesanan("Perubahan status ini tidak diizinkan.");
      }

      if (input.ke === "dibatalkan" && kembalikanStokSaatBatal(dari)) {
        const item = tx.select().from(orderItems).where(eq(orderItems.orderId, pesanan.id)).all();
        for (const i of item) {
          if (i.productId === null) continue;
          tx.update(products)
            .set({
              stock: sql`${products.stock} + ${i.quantity}`,
              soldCount: sql`max(${products.soldCount} - ${i.quantity}, 0)`,
            })
            .where(eq(products.id, i.productId))
            .run();
        }
      }

      tx.update(orders)
        .set({
          status: input.ke,
          updatedAt: sekarang,
          ...(input.ke === "dibayar" ? { paidAt: sekarang } : {}),
        })
        .where(eq(orders.id, pesanan.id))
        .run();
      tx.insert(orderStatusHistory)
        .values({
          orderId: pesanan.id,
          status: input.ke,
          actor: input.pelaku,
          note: input.catatan ?? "",
          createdAt: sekarang,
        })
        .run();
      return { dari, ke: input.ke };
    },
    { behavior: "immediate" },
  );
}

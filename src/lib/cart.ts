import { z } from "zod";

/**
 * Logika keranjang yang murni (tanpa I/O) sehingga mudah diuji.
 * Keranjang disimpan di cookie sebagai JSON ringkas: [[idProduk, jumlah], ...].
 * Harga TIDAK disimpan di cookie; harga selalu diambil ulang dari database.
 */

export const MAKS_BARIS_KERANJANG = 30;
export const MAKS_JUMLAH_PER_PRODUK = 99;

export type BarisKeranjang = { productId: number; quantity: number };
export type Keranjang = BarisKeranjang[];

const barisCookieSchema = z.tuple([
  z.number().int().positive(),
  z.number().int().min(1).max(MAKS_JUMLAH_PER_PRODUK),
]);
const keranjangCookieSchema = z.array(barisCookieSchema).max(MAKS_BARIS_KERANJANG);

/** Membaca isi cookie. Data rusak atau dimanipulasi menghasilkan keranjang kosong. */
export function parseKeranjang(mentah: string | undefined | null): Keranjang {
  if (!mentah) return [];
  let data: unknown;
  try {
    data = JSON.parse(mentah);
  } catch {
    return [];
  }
  const hasil = keranjangCookieSchema.safeParse(data);
  if (!hasil.success) return [];
  // Gabungkan baris duplikat (kalau cookie disunting manual).
  return hasil.data.reduce<Keranjang>(
    (keranjang, [productId, quantity]) => tambahKeKeranjang(keranjang, productId, quantity),
    [],
  );
}

export function serializeKeranjang(keranjang: Keranjang): string {
  return JSON.stringify(keranjang.map((b) => [b.productId, b.quantity]));
}

function batasiJumlah(jumlah: number, stok?: number): number {
  const batasAtas = Math.min(MAKS_JUMLAH_PER_PRODUK, stok ?? MAKS_JUMLAH_PER_PRODUK);
  return Math.max(0, Math.min(Math.trunc(jumlah), batasAtas));
}

/**
 * Menambah produk. Kalau produk sudah ada, jumlahnya dijumlahkan.
 * `stok` (opsional) membatasi jumlah total agar tidak melebihi stok tersedia.
 */
export function tambahKeKeranjang(
  keranjang: Keranjang,
  productId: number,
  jumlah: number,
  stok?: number,
): Keranjang {
  if (!Number.isInteger(productId) || productId <= 0 || jumlah <= 0) return keranjang;
  const ada = keranjang.find((b) => b.productId === productId);
  if (ada) {
    const baru = batasiJumlah(ada.quantity + jumlah, stok);
    if (baru <= 0) return hapusDariKeranjang(keranjang, productId);
    return keranjang.map((b) => (b.productId === productId ? { ...b, quantity: baru } : b));
  }
  if (keranjang.length >= MAKS_BARIS_KERANJANG) return keranjang;
  const baru = batasiJumlah(jumlah, stok);
  if (baru <= 0) return keranjang;
  return [...keranjang, { productId, quantity: baru }];
}

/** Mengubah jumlah sebuah produk. Jumlah 0 atau kurang berarti dihapus. */
export function ubahJumlah(
  keranjang: Keranjang,
  productId: number,
  jumlah: number,
  stok?: number,
): Keranjang {
  if (jumlah <= 0) return hapusDariKeranjang(keranjang, productId);
  const baru = batasiJumlah(jumlah, stok);
  if (baru <= 0) return hapusDariKeranjang(keranjang, productId);
  return keranjang.map((b) => (b.productId === productId ? { ...b, quantity: baru } : b));
}

export function hapusDariKeranjang(keranjang: Keranjang, productId: number): Keranjang {
  return keranjang.filter((b) => b.productId !== productId);
}

export function jumlahItem(keranjang: Keranjang): number {
  return keranjang.reduce((total, b) => total + b.quantity, 0);
}

export type InfoProduk = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  imagePath: string;
};

export type BarisTerhitung = {
  product: InfoProduk;
  quantity: number;
  lineTotal: number;
};

export type MasalahKeranjang =
  | { jenis: "tidak-tersedia"; productId: number }
  | { jenis: "stok-kurang"; productId: number; nama: string; diminta: number; tersedia: number };

/**
 * Mencocokkan keranjang dengan data produk terbaru dari database:
 * - produk yang hilang/nonaktif/stok habis dibuang,
 * - jumlah yang melebihi stok diturunkan ke stok tersedia,
 * - subtotal dihitung dari harga database.
 */
export function rekonsiliasiKeranjang(
  keranjang: Keranjang,
  produk: ReadonlyMap<number, InfoProduk>,
): { baris: BarisTerhitung[]; masalah: MasalahKeranjang[]; subtotal: number; keranjang: Keranjang } {
  const baris: BarisTerhitung[] = [];
  const masalah: MasalahKeranjang[] = [];
  for (const item of keranjang) {
    const p = produk.get(item.productId);
    if (!p || !p.isActive || p.stock <= 0) {
      masalah.push({ jenis: "tidak-tersedia", productId: item.productId });
      continue;
    }
    let quantity = item.quantity;
    if (quantity > p.stock) {
      masalah.push({
        jenis: "stok-kurang",
        productId: p.id,
        nama: p.name,
        diminta: quantity,
        tersedia: p.stock,
      });
      quantity = p.stock;
    }
    baris.push({ product: p, quantity, lineTotal: p.price * quantity });
  }
  const subtotal = baris.reduce((total, b) => total + b.lineTotal, 0);
  return {
    baris,
    masalah,
    subtotal,
    keranjang: baris.map((b) => ({ productId: b.product.id, quantity: b.quantity })),
  };
}

/** Total pesanan: subtotal barang + ongkir. */
export function hitungTotal(subtotal: number, ongkir: number): number {
  return subtotal + ongkir;
}

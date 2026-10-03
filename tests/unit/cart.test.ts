import { describe, expect, it } from "vitest";
import {
  hapusDariKeranjang,
  hitungTotal,
  jumlahItem,
  type InfoProduk,
  type Keranjang,
  MAKS_BARIS_KERANJANG,
  MAKS_JUMLAH_PER_PRODUK,
  parseKeranjang,
  rekonsiliasiKeranjang,
  serializeKeranjang,
  tambahKeKeranjang,
  ubahJumlah,
} from "@/lib/cart";

function produk(id: number, ubah: Partial<InfoProduk> = {}): InfoProduk {
  return {
    id,
    name: `Produk ${id}`,
    slug: `produk-${id}`,
    price: 10_000 * id,
    stock: 10,
    isActive: true,
    imagePath: `/images/produk/produk-${id}.svg`,
    ...ubah,
  };
}

describe("menambah dan mengubah isi keranjang", () => {
  it("menambah produk baru dan menjumlahkan produk yang sama", () => {
    let k: Keranjang = [];
    k = tambahKeKeranjang(k, 1, 2);
    k = tambahKeKeranjang(k, 2, 1);
    k = tambahKeKeranjang(k, 1, 3);
    expect(k).toEqual([
      { productId: 1, quantity: 5 },
      { productId: 2, quantity: 1 },
    ]);
    expect(jumlahItem(k)).toBe(6);
  });

  it("tidak melebihi stok dan batas per produk", () => {
    expect(tambahKeKeranjang([], 1, 8, 5)).toEqual([{ productId: 1, quantity: 5 }]);
    expect(tambahKeKeranjang([{ productId: 1, quantity: 4 }], 1, 4, 5)).toEqual([{ productId: 1, quantity: 5 }]);
    expect(tambahKeKeranjang([], 1, 500)).toEqual([{ productId: 1, quantity: MAKS_JUMLAH_PER_PRODUK }]);
  });

  it("mengabaikan masukan tidak valid dan produk dengan stok 0", () => {
    expect(tambahKeKeranjang([], 1, 0)).toEqual([]);
    expect(tambahKeKeranjang([], 1, -3)).toEqual([]);
    expect(tambahKeKeranjang([], -1, 1)).toEqual([]);
    expect(tambahKeKeranjang([], 1.5, 1)).toEqual([]);
    expect(tambahKeKeranjang([], 1, 2, 0)).toEqual([]);
  });

  it("membatasi jumlah baris keranjang", () => {
    let k: Keranjang = [];
    for (let id = 1; id <= MAKS_BARIS_KERANJANG + 5; id++) k = tambahKeKeranjang(k, id, 1);
    expect(k).toHaveLength(MAKS_BARIS_KERANJANG);
  });

  it("ubahJumlah mengganti jumlah, dan jumlah 0 menghapus baris", () => {
    const awal: Keranjang = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ];
    expect(ubahJumlah(awal, 1, 7)).toEqual([
      { productId: 1, quantity: 7 },
      { productId: 2, quantity: 1 },
    ]);
    expect(ubahJumlah(awal, 1, 0)).toEqual([{ productId: 2, quantity: 1 }]);
    expect(ubahJumlah(awal, 2, 50, 3)).toEqual([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 3 },
    ]);
  });

  it("hapusDariKeranjang hanya menghapus produk yang dimaksud", () => {
    expect(hapusDariKeranjang([{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }], 1)).toEqual([
      { productId: 2, quantity: 2 },
    ]);
  });
});

describe("cookie keranjang (bertahan setelah reload)", () => {
  it("serialize lalu parse menghasilkan keranjang yang sama", () => {
    const k: Keranjang = [
      { productId: 3, quantity: 2 },
      { productId: 9, quantity: 1 },
    ];
    expect(parseKeranjang(serializeKeranjang(k))).toEqual(k);
    expect(serializeKeranjang(k)).toBe("[[3,2],[9,1]]");
  });

  it("cookie rusak atau dimanipulasi menjadi keranjang kosong", () => {
    expect(parseKeranjang(undefined)).toEqual([]);
    expect(parseKeranjang("")).toEqual([]);
    expect(parseKeranjang("bukan json")).toEqual([]);
    expect(parseKeranjang('{"a":1}')).toEqual([]);
    expect(parseKeranjang("[[1,-5]]")).toEqual([]);
    expect(parseKeranjang("[[1,1000]]")).toEqual([]);
    expect(parseKeranjang('[["1",2]]')).toEqual([]);
    expect(parseKeranjang(JSON.stringify(Array.from({ length: 31 }, (_, i) => [i + 1, 1])))).toEqual([]);
  });

  it("menggabungkan baris duplikat dari cookie", () => {
    expect(parseKeranjang("[[1,2],[1,3]]")).toEqual([{ productId: 1, quantity: 5 }]);
  });
});

describe("rekonsiliasi dengan data produk terbaru", () => {
  it("menghitung subtotal dari harga database, bukan dari cookie", () => {
    const map = new Map([
      [1, produk(1, { price: 25_000 })],
      [2, produk(2, { price: 40_000 })],
    ]);
    const hasil = rekonsiliasiKeranjang(
      [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      map,
    );
    expect(hasil.subtotal).toBe(90_000);
    expect(hasil.masalah).toEqual([]);
    expect(hasil.baris.map((b) => b.lineTotal)).toEqual([50_000, 40_000]);
    expect(hitungTotal(hasil.subtotal, 12_000)).toBe(102_000);
  });

  it("membuang produk yang hilang, nonaktif, atau habis", () => {
    const map = new Map([
      [1, produk(1, { isActive: false })],
      [2, produk(2, { stock: 0 })],
      [3, produk(3)],
    ]);
    const hasil = rekonsiliasiKeranjang(
      [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
        { productId: 99, quantity: 1 },
      ],
      map,
    );
    expect(hasil.keranjang).toEqual([{ productId: 3, quantity: 1 }]);
    expect(hasil.masalah.map((m) => m.productId)).toEqual([1, 2, 99]);
    expect(hasil.subtotal).toBe(30_000);
  });

  it("menurunkan jumlah yang melebihi stok", () => {
    const hasil = rekonsiliasiKeranjang([{ productId: 1, quantity: 8 }], new Map([[1, produk(1, { stock: 3 })]]));
    expect(hasil.keranjang).toEqual([{ productId: 1, quantity: 3 }]);
    expect(hasil.masalah).toEqual([
      { jenis: "stok-kurang", productId: 1, nama: "Produk 1", diminta: 8, tersedia: 3 },
    ]);
    expect(hasil.subtotal).toBe(30_000);
  });
});

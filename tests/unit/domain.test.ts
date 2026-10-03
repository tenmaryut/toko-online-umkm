import { describe, expect, it } from "vitest";
import { samarkanAlamat, samarkanEmail, samarkanNama, samarkanTelepon } from "@/lib/mask";
import {
  bolehUbahStatus,
  kembalikanStokSaatBatal,
  transisiBerikutnya,
} from "@/lib/order-status";
import { buatRateLimiter, formatTunggu, headerDenganIpAsli, ipKlien, proxyTepercaya } from "@/lib/rate-limit";
import { buatSlug } from "@/lib/slug";
import {
  skemaCheckout,
  skemaDaftar,
  skemaProduk,
  skemaQueryKatalog,
  tujuanAman,
} from "@/lib/validation";

describe("status pesanan", () => {
  it("admin mengikuti alur dibayar → dikemas → dikirim → selesai", () => {
    expect(bolehUbahStatus("dibayar", "dikemas", "admin")).toBe(true);
    expect(bolehUbahStatus("dikemas", "dikirim", "admin")).toBe(true);
    expect(bolehUbahStatus("dikirim", "selesai", "admin")).toBe(true);
    expect(bolehUbahStatus("dibayar", "selesai", "admin")).toBe(false);
    expect(bolehUbahStatus("selesai", "dikirim", "admin")).toBe(false);
    expect(transisiBerikutnya("dibatalkan", "admin")).toEqual([]);
  });

  it("pelanggan hanya bisa membayar atau membatalkan pesanan yang belum dibayar", () => {
    expect(transisiBerikutnya("menunggu_pembayaran", "pelanggan")).toEqual(["dibayar", "dibatalkan"]);
    expect(bolehUbahStatus("dibayar", "dibatalkan", "pelanggan")).toBe(false);
    expect(bolehUbahStatus("dikirim", "selesai", "pelanggan")).toBe(false);
  });

  it("stok dikembalikan hanya kalau barang belum dikirim", () => {
    expect(kembalikanStokSaatBatal("dibayar")).toBe(true);
    expect(kembalikanStokSaatBatal("dikirim")).toBe(false);
  });
});

describe("rate limit", () => {
  it("menolak setelah batas tercapai lalu pulih setelah jendela waktu lewat", () => {
    const rl = buatRateLimiter({ batas: 3, jendelaMs: 60_000 });
    const t0 = 1_000_000;
    expect(rl.cek("ip:1", t0).ok).toBe(true);
    expect(rl.cek("ip:1", t0 + 1).ok).toBe(true);
    expect(rl.cek("ip:1", t0 + 2).ok).toBe(true);
    const ditolak = rl.cek("ip:1", t0 + 3);
    expect(ditolak.ok).toBe(false);
    expect(ditolak.cobaLagiDalamMs).toBe(60_000 - 3);
    expect(rl.cek("ip:2", t0 + 3).ok).toBe(true); // kunci lain tidak terpengaruh
    expect(rl.cek("ip:1", t0 + 60_001).ok).toBe(true);
  });

  it("reset menghapus hitungan", () => {
    const rl = buatRateLimiter({ batas: 1, jendelaMs: 1000 });
    rl.cek("a", 0);
    expect(rl.cek("a", 1).ok).toBe(false);
    rl.reset("a");
    expect(rl.cek("a", 2).ok).toBe(true);
  });

  it("memakai IP pengunjung asli di balik Funnel + Caddy (proxy tepercaya hanya loopback)", () => {
    const ip = (xff?: string) => ipKlien(new Headers(xff === undefined ? {} : { "x-forwarded-for": xff }));
    // Funnel menambahkan IP pengunjung, Caddy (127.0.0.1) menambahkan dirinya.
    expect(ip("203.0.113.7, 127.0.0.1")).toBe("203.0.113.7");
    // Nilai palsu dari pengunjung di sisi kiri diabaikan.
    expect(ip("6.6.6.6, 203.0.113.7, 127.0.0.1")).toBe("203.0.113.7");
    expect(ip("6.6.6.6, 1.2.3.4")).toBe("1.2.3.4");
    // IPv6, kurung, dan port dirapikan; loopback IPv6 juga dipercaya.
    expect(ip("[2001:db8::5]:443, ::1")).toBe("2001:db8::5");
    expect(ip("198.51.100.9:5555, 127.0.0.1")).toBe("198.51.100.9");
    // Semua lompatan dari server ini, atau tanpa proxy sama sekali.
    expect(ip("127.0.0.1")).toBe("127.0.0.1");
    expect(ip()).toBe("lokal");
    expect(proxyTepercaya("127.0.0.1")).toBe(true);
    expect(proxyTepercaya("::ffff:127.0.0.1")).toBe(true);
    expect(proxyTepercaya("10.0.0.1")).toBe(false);
    expect(headerDenganIpAsli(new Headers({ "x-forwarded-for": "9.9.9.9, 203.0.113.7, 127.0.0.1" })).get("x-forwarded-for")).toBe(
      "203.0.113.7",
    );
    expect(formatTunggu(5_000)).toBe("5 detik");
    expect(formatTunggu(125_000)).toBe("3 menit");
  });
});

describe("penyamaran data pribadi untuk admin demo", () => {
  it("menyamarkan email, telepon, nama, dan alamat", () => {
    expect(samarkanEmail("budi.santoso@example.com")).toBe("bu**********@e******.com");
    expect(samarkanTelepon("081234567890")).toBe("0812******90");
    expect(samarkanNama("Budi Santoso")).toBe("B*** S******");
    expect(samarkanAlamat("Jl. Mawar No. 5")).toBe("[alamat disamarkan untuk admin demo]");
  });
});

describe("validasi Zod", () => {
  const checkoutValid = {
    recipientName: "Pelanggan Demo",
    phone: "0812-3456-7890",
    addressLine: "Jl. Contoh Demo No. 1, RT 01/RW 02",
    city: "Kota Contoh",
    province: "Jawa Tengah",
    postalCode: "50111",
    shippingService: "kilat",
    paymentMethod: "qris",
  };

  it("checkout valid dinormalisasi", () => {
    const hasil = skemaCheckout.parse(checkoutValid);
    expect(hasil.phone).toBe("081234567890");
    expect(hasil.note).toBe("");
  });

  it("checkout menolak provinsi, kode pos, dan nomor HP tidak valid", () => {
    expect(skemaCheckout.safeParse({ ...checkoutValid, province: "Atlantis" }).success).toBe(false);
    expect(skemaCheckout.safeParse({ ...checkoutValid, postalCode: "123" }).success).toBe(false);
    expect(skemaCheckout.safeParse({ ...checkoutValid, phone: "12345" }).success).toBe(false);
    expect(skemaCheckout.safeParse({ ...checkoutValid, shippingService: "gratis" }).success).toBe(false);
  });

  it("pendaftaran mewajibkan persetujuan dan kata sandi yang sama", () => {
    const dasar = {
      name: "Tester",
      email: "Tester@Contoh.TEST ",
      password: "rahasia123",
      confirmPassword: "rahasia123",
      consent: "on",
    };
    expect(skemaDaftar.parse(dasar).email).toBe("tester@contoh.test");
    expect(skemaDaftar.safeParse({ ...dasar, consent: undefined }).success).toBe(false);
    expect(skemaDaftar.safeParse({ ...dasar, confirmPassword: "lain12345" }).success).toBe(false);
    expect(skemaDaftar.safeParse({ ...dasar, password: "pendek", confirmPassword: "pendek" }).success).toBe(false);
  });

  it("query katalog yang aneh jatuh ke nilai bawaan", () => {
    expect(skemaQueryKatalog.parse({ urut: "hack", hal: "-3", min: "abc", kategori: "../x" })).toEqual({
      q: undefined,
      kategori: undefined,
      min: undefined,
      max: undefined,
      urut: "terbaru",
      tersedia: false,
      hal: 1,
    });
    expect(skemaQueryKatalog.parse({ q: "kopi", min: "Rp 10.000", urut: ["termurah", "x"], tersedia: "1" })).toMatchObject({
      q: "kopi",
      min: 10000,
      urut: "terbaru",
      tersedia: true,
    });
  });

  it("produk admin: harga dibaca dari teks Rupiah, kotak centang jadi boolean", () => {
    const hasil = skemaProduk.parse({
      name: "Kopi Uji",
      slug: "",
      categoryId: "2",
      price: "Rp 45.000",
      stock: "12",
      weightGrams: "250",
      description: "Deskripsi produk uji yang cukup panjang.",
      isActive: "on",
    });
    expect(hasil).toMatchObject({ price: 45000, stock: 12, categoryId: 2, isActive: true, isFeatured: false });
    expect(hasil.slug).toBeUndefined();
  });

  it("redirect setelah login hanya ke path internal yang aman", () => {
    expect(tujuanAman("/checkout", "/akun")).toBe("/checkout");
    expect(tujuanAman("/akun/pesanan/LK261002-ABCD", "/akun")).toBe("/akun/pesanan/LK261002-ABCD");
    expect(tujuanAman("//evil.example", "/akun")).toBe("/akun");
    expect(tujuanAman("https://evil.example", "/akun")).toBe("/akun");
    expect(tujuanAman("/\\evil", "/akun")).toBe("/akun");
    expect(tujuanAman("/lainnya", "/akun")).toBe("/akun");
    expect(tujuanAman(undefined, "/akun")).toBe("/akun");
  });

  it("buatSlug menghasilkan slug yang rapi", () => {
    expect(buatSlug("Kopi Arabika Lereng Pagi (200 g)")).toBe("kopi-arabika-lereng-pagi-200-g");
    expect(buatSlug("  Teh & Rempah  ")).toBe("teh-dan-rempah");
    expect(buatSlug("Café Ñusantara")).toBe("cafe-nusantara");
  });
});

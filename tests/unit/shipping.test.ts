import { describe, expect, it } from "vitest";
import {
  hitungOngkir,
  kutipOngkir,
  LAYANAN_IDS,
  pilihanPengiriman,
  PROVINSI,
  TARIF,
  ZONA_IDS,
  zonaUntukProvinsi,
} from "@/lib/shipping";

describe("zona pengiriman", () => {
  it("mencakup 38 provinsi tanpa duplikat", () => {
    expect(PROVINSI).toHaveLength(38);
    expect(new Set(PROVINSI.map((p) => p.nama)).size).toBe(38);
  });

  it("memetakan provinsi ke zona yang benar", () => {
    expect(zonaUntukProvinsi("Jawa Tengah")).toBe("zona-1");
    expect(zonaUntukProvinsi("Jakarta")).toBe("zona-1");
    expect(zonaUntukProvinsi("Bali")).toBe("zona-2");
    expect(zonaUntukProvinsi("Aceh")).toBe("zona-2");
    expect(zonaUntukProvinsi("Sulawesi Selatan")).toBe("zona-3");
    expect(zonaUntukProvinsi("Kalimantan Utara")).toBe("zona-3");
    expect(zonaUntukProvinsi("Papua Pegunungan")).toBe("zona-4");
    expect(zonaUntukProvinsi("Maluku Utara")).toBe("zona-4");
  });

  it("mengembalikan null untuk provinsi yang tidak dikenal", () => {
    expect(zonaUntukProvinsi("Atlantis")).toBeNull();
    expect(zonaUntukProvinsi("jawa tengah")).toBeNull(); // harus persis sesuai daftar
  });

  it("setiap zona punya provinsi", () => {
    for (const zona of ZONA_IDS) {
      expect(PROVINSI.some((p) => p.zona === zona)).toBe(true);
    }
  });
});

describe("ongkir tetap per zona", () => {
  it("memakai tarif tetap sesuai tabel", () => {
    expect(hitungOngkir("zona-1", "reguler")).toBe(12_000);
    expect(hitungOngkir("zona-1", "kilat")).toBe(22_000);
    expect(hitungOngkir("zona-2", "reguler")).toBe(24_000);
    expect(hitungOngkir("zona-3", "kilat")).toBe(52_000);
    expect(hitungOngkir("zona-4", "reguler")).toBe(48_000);
    expect(hitungOngkir("zona-4", "kilat")).toBe(79_000);
  });

  it("zona yang lebih jauh tidak pernah lebih murah, dan kilat selalu lebih mahal dari reguler", () => {
    for (const layanan of LAYANAN_IDS) {
      const biaya = ZONA_IDS.map((z) => TARIF[z][layanan].biaya);
      expect([...biaya].sort((a, b) => a - b)).toEqual(biaya);
    }
    for (const zona of ZONA_IDS) {
      expect(TARIF[zona].kilat.biaya).toBeGreaterThan(TARIF[zona].reguler.biaya);
    }
  });

  it("tidak bergantung pada provinsi lain di zona yang sama", () => {
    expect(kutipOngkir("Jawa Barat", "reguler").biaya).toBe(kutipOngkir("Jawa Timur", "reguler").biaya);
  });

  it("kutipOngkir mengembalikan zona, biaya, dan estimasi", () => {
    expect(kutipOngkir("Jawa Tengah", "kilat")).toEqual({
      zona: "zona-1",
      layanan: "kilat",
      biaya: 22_000,
      estimasi: "1 hari",
    });
  });

  it("kutipOngkir menolak provinsi atau layanan tidak valid", () => {
    expect(() => kutipOngkir("Atlantis", "reguler")).toThrow(/Provinsi tidak dikenal/);
    expect(() => kutipOngkir("Bali", "sameday")).toThrow(/Layanan pengiriman tidak dikenal/);
  });

  it("pilihanPengiriman diurutkan dari yang termurah", () => {
    const pilihan = pilihanPengiriman("zona-3");
    expect(pilihan.map((p) => p.layanan)).toEqual(["reguler", "kilat"]);
    expect(pilihan[0]?.biaya).toBe(32_000);
  });
});

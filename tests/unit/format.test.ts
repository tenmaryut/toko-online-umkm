import { describe, expect, it } from "vitest";
import {
  formatAngka,
  formatBerat,
  formatRupiah,
  formatTanggal,
  formatTanggalJam,
  kunciHariWIB,
  parseRupiah,
} from "@/lib/format";

const NBSP = " ";

describe("formatRupiah", () => {
  it("memakai format id-ID: awalan Rp dan pemisah ribuan titik", () => {
    expect(formatRupiah(15000)).toBe(`Rp${NBSP}15.000`);
    expect(formatRupiah(1250000)).toBe(`Rp${NBSP}1.250.000`);
  });

  it("tidak menampilkan desimal dan membulatkan nilai pecahan", () => {
    expect(formatRupiah(0)).toBe(`Rp${NBSP}0`);
    expect(formatRupiah(999.6)).toBe(`Rp${NBSP}1.000`);
    expect(formatRupiah(78000)).not.toContain(",");
  });

  it("menangani nominal negatif (mis. potongan)", () => {
    expect(formatRupiah(-5000)).toBe(`-Rp${NBSP}5.000`);
  });

  it("menolak nilai bukan angka", () => {
    expect(() => formatRupiah(Number.NaN)).toThrow(RangeError);
    expect(() => formatRupiah(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("parseRupiah", () => {
  it("membaca berbagai bentuk masukan harga", () => {
    expect(parseRupiah("15000")).toBe(15000);
    expect(parseRupiah("15.000")).toBe(15000);
    expect(parseRupiah("Rp 1.250.000")).toBe(1250000);
  });

  it("mengembalikan null kalau tidak ada angka atau terlalu panjang", () => {
    expect(parseRupiah("")).toBeNull();
    expect(parseRupiah("gratis")).toBeNull();
    expect(parseRupiah("9".repeat(13))).toBeNull();
  });

  it("bolak-balik dengan formatRupiah", () => {
    for (const n of [0, 1000, 78000, 1_250_000, 99_999_999]) {
      expect(parseRupiah(formatRupiah(n))).toBe(n);
    }
  });
});

describe("format angka, berat, dan tanggal", () => {
  it("memformat angka dan berat", () => {
    expect(formatAngka(1250)).toBe("1.250");
    expect(formatBerat(250)).toBe("250 g");
    expect(formatBerat(1500)).toBe("1,5 kg");
    expect(formatBerat(1000)).toBe("1 kg");
  });

  it("memakai zona waktu WIB", () => {
    // 2026-10-01 18:30 UTC = 2 Oktober 2026 01.30 WIB
    const t = new Date(Date.UTC(2026, 9, 1, 18, 30));
    expect(formatTanggal(t)).toBe("2 Oktober 2026");
    expect(formatTanggalJam(t)).toMatch(/^2 Okt 2026.*01\.30 WIB$/);
    expect(kunciHariWIB(t)).toBe("2026-10-02");
  });
});

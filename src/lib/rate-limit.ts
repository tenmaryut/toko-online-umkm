/**
 * Pembatas laju sederhana di memori (fixed window). Cukup untuk satu proses Node di satu server.
 * Kalau aplikasi dijalankan lebih dari satu instance, ganti dengan penyimpanan bersama (mis. Redis).
 */

type Entri = { jumlah: number; resetPada: number };

export type HasilCek = { ok: boolean; sisa: number; cobaLagiDalamMs: number };

export type RateLimiter = {
  /** Mencatat satu percobaan untuk `kunci` dan mengembalikan apakah masih diizinkan. */
  cek(kunci: string, sekarang?: number): HasilCek;
  /** Menghapus catatan untuk `kunci` (mis. setelah login berhasil). */
  reset(kunci: string): void;
  ukuran(): number;
};

export function buatRateLimiter(opsi: { batas: number; jendelaMs: number; maksKunci?: number }): RateLimiter {
  const { batas, jendelaMs, maksKunci = 10_000 } = opsi;
  const simpanan = new Map<string, Entri>();

  function bersihkan(sekarang: number) {
    for (const [kunci, entri] of simpanan) {
      if (entri.resetPada <= sekarang) simpanan.delete(kunci);
    }
  }

  return {
    cek(kunci, sekarang = Date.now()) {
      if (simpanan.size >= maksKunci) bersihkan(sekarang);
      let entri = simpanan.get(kunci);
      if (!entri || entri.resetPada <= sekarang) {
        entri = { jumlah: 0, resetPada: sekarang + jendelaMs };
        simpanan.set(kunci, entri);
      }
      entri.jumlah += 1;
      const ok = entri.jumlah <= batas;
      return {
        ok,
        sisa: Math.max(0, batas - entri.jumlah),
        cobaLagiDalamMs: ok ? 0 : entri.resetPada - sekarang,
      };
    },
    reset(kunci) {
      simpanan.delete(kunci);
    },
    ukuran() {
      return simpanan.size;
    },
  };
}

/**
 * IP klien dari header. Aplikasi hanya mendengarkan di 127.0.0.1 di belakang Caddy,
 * dan Caddy mengisi X-Forwarded-For; entri terakhir adalah alamat yang dilihat Caddy.
 */
export function ipKlien(header: Headers): string {
  const xff = header.get("x-forwarded-for");
  if (xff) {
    const bagian = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const terakhir = bagian.at(-1);
    if (terakhir) return terakhir.slice(0, 64);
  }
  return header.get("x-real-ip")?.slice(0, 64) ?? "tidak-diketahui";
}

/** Format durasi tunggu yang ramah dibaca, mis. "3 menit". */
export function formatTunggu(ms: number): string {
  const detik = Math.ceil(ms / 1000);
  if (detik < 60) return `${detik} detik`;
  return `${Math.ceil(detik / 60)} menit`;
}

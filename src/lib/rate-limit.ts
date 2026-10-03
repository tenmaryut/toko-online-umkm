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

/** Proxy yang dipercaya hanya loopback: Caddy dan Tailscale Funnel di server yang sama. */
export function proxyTepercaya(ip: string): boolean {
  return ip === "::1" || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip) || /^::ffff:127\./i.test(ip);
}

/** Rapikan satu entri X-Forwarded-For: buang kurung IPv6 dan port. */
function normalkanIp(entri: string): string {
  const s = entri.trim();
  const v6 = s.match(/^\[([0-9a-f:.]+)\](?::\d+)?$/i);
  if (v6) return v6[1]!.toLowerCase();
  const v4 = s.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (v4) return v4[1]!;
  return s.toLowerCase();
}

/**
 * IP pengunjung asli dari X-Forwarded-For.
 * Rantai: pengunjung → Tailscale Funnel (menambahkan IP pengunjung) → Caddy di 127.0.0.1
 * (menambahkan 127.0.0.1) → aplikasi, yang hanya mendengarkan 127.0.0.1. Daftar ditelusuri dari
 * kanan dan proxy tepercaya (loopback) dilewati, sehingga nilai palsu yang dikirim pengunjung
 * di sisi kiri header tidak pernah dipakai.
 */
export function ipKlien(header: Headers): string {
  const xff = header.get("x-forwarded-for");
  if (!xff) return "lokal";
  const daftar = xff
    .split(",")
    .map(normalkanIp)
    .filter(Boolean);
  for (let i = daftar.length - 1; i >= 0; i--) {
    const ip = daftar[i]!;
    if (!proxyTepercaya(ip)) return ip.slice(0, 64);
  }
  return daftar[0] ?? "lokal";
}

/** Salinan header dengan X-Forwarded-For berisi IP pengunjung asli saja (untuk dicatat Better Auth di sesi). */
export function headerDenganIpAsli(header: Headers): Headers {
  const salinan = new Headers(header);
  salinan.set("x-forwarded-for", ipKlien(header));
  return salinan;
}

/** Format durasi tunggu yang ramah dibaca, mis. "3 menit". */
export function formatTunggu(ms: number): string {
  const detik = Math.ceil(ms / 1000);
  if (detik < 60) return `${detik} detik`;
  return `${Math.ceil(detik / 60)} menit`;
}

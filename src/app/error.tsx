"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Halaman galat 500 khusus untuk kesalahan di dalam halaman. */
export default function HalamanGalat({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.warn("Galat halaman", error.digest ?? "");
  }, [error]);

  return (
    <main id="konten" className="flex flex-1 items-center">
      <div className="wadah max-w-xl py-20 text-center">
        <svg viewBox="0 0 120 80" className="mx-auto h-24 w-auto" aria-hidden="true">
          <path d="M10 64c18-10 36-12 56-4s34 6 44-2" stroke="#8a9a93" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M38 40 60 16l22 24Z" fill="#9c4524" />
          <path d="M46 40h28v16H46Z" fill="#c98b4b" />
          <path d="M57 44h6v8h-6Z" fill="#5b3a22" />
        </svg>
        <p className="mt-6 font-mono text-sm font-semibold text-tanah">Galat 500</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Ada yang macet di lumbung</h1>
        <p className="mt-3 text-arang-2">
          Terjadi kesalahan di server saat menyiapkan halaman ini. Coba muat ulang; kalau masih gagal, kembali ke beranda.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-arang-2">Kode: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="tombol-utama">
            Coba lagi
          </button>
          <Link href="/" className="tombol-garis">
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}

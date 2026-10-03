"use client";

import { useEffect, useRef } from "react";
import { formatAngka, formatRupiah } from "@/lib/format";

const tulis = (jenis: "rupiah" | "angka", v: number) => (jenis === "rupiah" ? formatRupiah(v) : formatAngka(v));

/**
 * Angka ringkasan yang menghitung naik dari 0 ke nilai asli. HTML awal sudah berisi nilai akhir
 * (tampil penuh tanpa JavaScript), dan animasi dilewati bila pengguna meminta gerak dikurangi.
 */
export function AngkaNaik({ nilai, jenis }: { nilai: number; jenis: "rupiah" | "angka" }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || nilai <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const durasi = 1100;
    const mulai = performance.now();
    let id = 0;
    const langkah = (t: number) => {
      const p = Math.min(1, (t - mulai) / durasi);
      el.textContent = tulis(jenis, Math.round(nilai * (1 - (1 - p) ** 3)));
      if (p < 1) id = requestAnimationFrame(langkah);
    };
    el.textContent = tulis(jenis, 0);
    id = requestAnimationFrame(langkah);
    return () => {
      cancelAnimationFrame(id);
      el.textContent = tulis(jenis, nilai);
    };
  }, [nilai, jenis]);
  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums" data-testid="angka-naik" data-nilai={nilai}>
        {tulis(jenis, nilai)}
      </span>
      <span className="sr-only">{tulis(jenis, nilai)}</span>
    </>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { type HasilKeranjang, tambahKeKeranjangAction } from "@/actions/keranjang";
import { IkonCentang, IkonKeranjang, IkonKurang, IkonTambah } from "./ikon";
import { useUmpanBalik } from "./umpan-balik";

/** Menampilkan keranjang mini/toast sekali untuk setiap hasil aksi, dan status "baru ditambahkan" sesaat. */
function useUmpanBalikKeranjang(hasil: HasilKeranjang) {
  const { tampilkanKeranjangMini, toast } = useUmpanBalik();
  const [hasilDiproses, setHasilDiproses] = useState<number | null>(null);
  const [suksesTerakhir, setSuksesTerakhir] = useState<number | null>(null);
  // Status diturunkan saat render dari hasil aksi yang baru (tanpa setState di dalam effect).
  if (hasil && hasil.waktu !== hasilDiproses) {
    setHasilDiproses(hasil.waktu);
    if (hasil.ok) setSuksesTerakhir(hasil.waktu);
  }
  useEffect(() => {
    if (!hasil) return;
    if (hasil.ok && hasil.mini) tampilkanKeranjangMini(hasil.mini);
    else if (!hasil.ok) toast(hasil.pesan, "galat");
  }, [hasil, tampilkanKeranjangMini, toast]);
  useEffect(() => {
    if (suksesTerakhir === null) return;
    const t = window.setTimeout(() => setSuksesTerakhir(null), 2200);
    return () => window.clearTimeout(t);
  }, [suksesTerakhir]);
  return suksesTerakhir !== null;
}

/** Tombol kecil di kartu produk: tambah 1 barang. */
export function TombolTambahCepat({ productId, stok, nama }: { productId: number; stok: number; nama: string }) {
  const [hasil, aksi, menunggu] = useActionState<HasilKeranjang, FormData>(tambahKeKeranjangAction, null);
  const baruDitambah = useUmpanBalikKeranjang(hasil);
  const habis = stok <= 0;
  return (
    <form action={aksi} className="relative z-10 mt-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={1} />
      <button
        type="submit"
        disabled={habis || menunggu}
        data-status={baruDitambah ? "ditambahkan" : undefined}
        className={`tombol w-full ${habis ? "border border-garis bg-kertas-2 text-arang-2" : "bg-lumut text-kertas hover:bg-lumut-tua"}`}
      >
        {habis ? (
          <>
            Stok habis<span className="sr-only">: {nama}</span>
          </>
        ) : baruDitambah && !menunggu ? (
          <>
            <IkonCentang ukuran={18} className="centang-masuk" /> Ditambahkan<span className="sr-only"> ke keranjang: {nama}</span>
          </>
        ) : (
          <>
            <IkonKeranjang ukuran={18} /> {menunggu ? "Menambahkan…" : "Tambah"}
            <span className="sr-only"> {nama} ke keranjang</span>
          </>
        )}
      </button>
      <p role="status" aria-live="polite" className={hasil && !hasil.ok ? "mt-2 text-xs font-medium text-bahaya" : "sr-only"}>
        {hasil?.pesan}
      </p>
    </form>
  );
}

/** Pemilih jumlah + tombol tambah di halaman detail produk. */
export function FormTambahKeranjang({ productId, stok }: { productId: number; stok: number }) {
  const [hasil, aksi, menunggu] = useActionState<HasilKeranjang, FormData>(tambahKeKeranjangAction, null);
  const baruDitambah = useUmpanBalikKeranjang(hasil);
  const [jumlah, setJumlah] = useState(1);
  const maks = Math.min(stok, 99);
  if (stok <= 0) {
    return (
      <p className="rounded-2xl border border-garis bg-kertas-2 px-4 py-3 text-sm font-semibold text-arang-2">
        Stok sedang habis. Coba lagi nanti atau lihat produk lain.
      </p>
    );
  }
  return (
    <form action={aksi} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="jumlah" className="label-form">
            Jumlah
          </label>
          <div className="inline-flex items-center rounded-full border border-arang/25 bg-white">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-arang hover:bg-kertas-2 disabled:opacity-40"
              onClick={() => setJumlah((j) => Math.max(1, j - 1))}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
            >
              <IkonKurang ukuran={18} />
            </button>
            <input
              id="jumlah"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={maks}
              value={jumlah}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                setJumlah(Number.isFinite(n) ? Math.min(Math.max(n, 1), maks) : 1);
              }}
              className="w-14 border-0 bg-transparent text-center text-base font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-arang hover:bg-kertas-2 disabled:opacity-40"
              onClick={() => setJumlah((j) => Math.min(maks, j + 1))}
              disabled={jumlah >= maks}
              aria-label="Tambah jumlah"
            >
              <IkonTambah ukuran={18} />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={menunggu}
          data-status={baruDitambah ? "ditambahkan" : undefined}
          className="tombol-utama flex-1 sm:flex-none sm:px-8"
        >
          {baruDitambah && !menunggu ? (
            <>
              <IkonCentang ukuran={18} className="centang-masuk" /> Ditambahkan
            </>
          ) : (
            <>
              <IkonKeranjang ukuran={18} />
              {menunggu ? "Menambahkan…" : "Tambah ke keranjang"}
            </>
          )}
        </button>
      </div>
      <div role="status" aria-live="polite" className="min-h-6 text-sm">
        {hasil && (
          <p className={hasil.ok ? "flex flex-wrap items-center gap-x-3 font-medium text-lumut" : "font-medium text-bahaya"}>
            <span>{hasil.pesan}</span>
            {hasil.ok && (
              <Link href="/keranjang" className="tombol-teks min-h-0">
                Lihat keranjang
              </Link>
            )}
          </p>
        )}
      </div>
    </form>
  );
}

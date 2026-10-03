"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { IkonCentang, IkonInfo, IkonPeringatan, IkonTutup } from "./ikon";

/**
 * Umpan balik antarmuka: toast yang meluncur masuk dan keranjang mini setelah menambah produk.
 * Keduanya non-modal: tidak merebut fokus, diumumkan lewat aria-live, dan menutup sendiri
 * (jeda saat disorot/difokus). Tanpa JavaScript, halaman tetap memakai pesan inline biasa.
 */

type JenisToast = "sukses" | "galat" | "info";
type Toast = { id: number; jenis: JenisToast; pesan: string; keluar?: boolean };

export type IsiKeranjangMini = {
  nama: string;
  gambar: string;
  jumlahDitambah: number;
  jumlahItem: number;
  subtotal: number;
};

type Konteks = {
  toast: (pesan: string, jenis?: JenisToast) => void;
  tampilkanKeranjangMini: (isi: IsiKeranjangMini) => void;
};

const KonteksUmpanBalik = createContext<Konteks | null>(null);

export function useUmpanBalik(): Konteks {
  const k = useContext(KonteksUmpanBalik);
  // Di luar penyedia (mis. halaman galat), umpan balik diabaikan tanpa merusak halaman.
  return k ?? { toast: () => {}, tampilkanKeranjangMini: () => {} };
}

const LAMA_TOAST = 4500;
const LAMA_KERANJANG_MINI = 6500;

export function PenyediaUmpanBalik({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);
  const [mini, setMini] = useState<(IsiKeranjangMini & { kunci: number }) | null>(null);
  const urut = useRef(0);

  const tutupToast = useCallback((id: number) => {
    setDaftar((d) => d.map((t) => (t.id === id ? { ...t, keluar: true } : t)));
    window.setTimeout(() => setDaftar((d) => d.filter((t) => t.id !== id)), 220);
  }, []);

  const toast = useCallback(
    (pesan: string, jenis: JenisToast = "sukses") => {
      const id = ++urut.current;
      setDaftar((d) => [...d.slice(-2), { id, jenis, pesan }]);
      window.setTimeout(() => tutupToast(id), LAMA_TOAST);
    },
    [tutupToast],
  );

  const tampilkanKeranjangMini = useCallback((isi: IsiKeranjangMini) => {
    setMini({ ...isi, kunci: ++urut.current });
  }, []);

  const nilai = useMemo(() => ({ toast, tampilkanKeranjangMini }), [toast, tampilkanKeranjangMini]);

  return (
    <KonteksUmpanBalik.Provider value={nilai}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-auto sm:w-80 sm:items-stretch"
      >
        {daftar.map((t) => (
          <ItemToast key={t.id} toast={t} onTutup={() => tutupToast(t.id)} />
        ))}
      </div>
      {mini && <KeranjangMini key={mini.kunci} isi={mini} onSelesai={() => setMini(null)} />}
    </KonteksUmpanBalik.Provider>
  );
}

const GAYA_TOAST: Record<JenisToast, string> = {
  sukses: "border-lumut/30 bg-lumut text-kertas",
  galat: "border-bahaya/30 bg-bahaya-muda text-bahaya",
  info: "border-arang/15 bg-arang text-kertas",
};

function ItemToast({ toast: t, onTutup }: { toast: Toast; onTutup: () => void }) {
  const Ikon = t.jenis === "galat" ? IkonPeringatan : t.jenis === "info" ? IkonInfo : IkonCentang;
  return (
    <div
      role={t.jenis === "galat" ? "alert" : undefined}
      data-testid="toast"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_12px_30px_-12px_rgb(36_28_21/0.45)] ${GAYA_TOAST[t.jenis]} ${t.keluar ? "keluar" : "toast-masuk"}`}
    >
      <Ikon ukuran={18} className="mt-0.5 shrink-0" />
      <span className="flex-1">{t.pesan}</span>
      <button type="button" onClick={onTutup} className="-m-1 rounded-full p-1 opacity-80 hover:opacity-100" aria-label="Tutup notifikasi">
        <IkonTutup ukuran={16} />
      </button>
    </div>
  );
}

function KeranjangMini({ isi, onSelesai }: { isi: IsiKeranjangMini; onSelesai: () => void }) {
  const [keluar, setKeluar] = useState(false);
  const [jeda, setJeda] = useState(false);
  const tutup = useCallback(() => {
    setKeluar(true);
    window.setTimeout(onSelesai, 220);
  }, [onSelesai]);

  useEffect(() => {
    if (jeda) return;
    const t = window.setTimeout(tutup, LAMA_KERANJANG_MINI);
    return () => window.clearTimeout(t);
  }, [jeda, tutup]);

  return (
    <aside
      aria-label="Keranjang mini"
      data-testid="keranjang-mini"
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      onFocus={() => setJeda(true)}
      onBlur={() => setJeda(false)}
      className={`fixed inset-x-3 bottom-3 z-50 rounded-[var(--radius-kartu)] border border-garis bg-kertas p-4 shadow-[0_24px_60px_-20px_rgb(36_28_21/0.55)] sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-36 sm:w-80 ${keluar ? "keluar" : "keranjang-mini-masuk"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-lumut" role="status">
          <span className="centang-masuk grid size-6 place-items-center rounded-full bg-lumut text-kertas">
            <IkonCentang ukuran={14} />
          </span>
          Ditambahkan ke keranjang
        </p>
        <button type="button" onClick={tutup} className="grid size-9 place-items-center rounded-full hover:bg-kertas-2" aria-label="Tutup keranjang mini">
          <IkonTutup ukuran={18} />
        </button>
      </div>
      <div className="mt-3 flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi kecil */}
        <img src={isi.gambar} alt="" width={64} height={64} className="size-16 rounded-xl bg-kertas-2 object-cover" />
        <div className="min-w-0 text-sm">
          <p className="font-display font-semibold leading-snug">{isi.nama}</p>
          <p className="mt-0.5 text-arang-2">+{isi.jumlahDitambah} barang</p>
        </div>
      </div>
      <p className="mt-3 flex justify-between border-t border-garis pt-3 text-sm">
        <span>Isi keranjang: {isi.jumlahItem} barang</span>
        <span className="font-semibold">{formatRupiah(isi.subtotal)}</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/keranjang" onClick={tutup} className="tombol-garis min-h-10 px-3">
          Keranjang
        </Link>
        <Link href="/checkout" onClick={tutup} className="tombol-utama min-h-10 px-3">
          Checkout
        </Link>
      </div>
    </aside>
  );
}

/** Lencana jumlah keranjang di header: memantul saat jumlahnya bertambah (bukan saat halaman dimuat). */
export function LencanaKeranjang({ jumlah }: { jumlah: number }) {
  const sebelumnya = useRef(jumlah);
  const [denyut, setDenyut] = useState(0);
  useEffect(() => {
    if (jumlah > sebelumnya.current) setDenyut((d) => d + 1);
    sebelumnya.current = jumlah;
  }, [jumlah]);
  return (
    <span
      key={denyut}
      className={`grid min-w-5 place-items-center rounded-full bg-kunyit px-1 text-xs font-bold leading-5 text-arang ${denyut > 0 ? "lencana-pantul" : ""}`}
      data-testid="jumlah-keranjang"
    >
      {jumlah}
      <span className="sr-only"> barang</span>
    </span>
  );
}

/** Toast sekali untuk setiap hasil aksi baru (dibedakan lewat `waktu`). */
export function useToastHasil(hasil: { ok?: boolean; pesan?: string; waktu?: number } | null | undefined) {
  const { toast } = useUmpanBalik();
  const terakhir = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!hasil?.waktu || !hasil.pesan || hasil.waktu === terakhir.current) return;
    terakhir.current = hasil.waktu;
    toast(hasil.pesan, hasil.ok === false ? "galat" : "sukses");
  }, [hasil, toast]);
}

/**
 * Menampilkan toast dari kode `?pesan=` (hasil redirect Server Action), lalu menghapus kodenya
 * dari URL. Pengguna tanpa JavaScript tetap melihat banner inline di halaman.
 */
export function ToastDariUrl({ daftar }: { daftar: Record<string, { teks: string; jenis?: JenisToast }> }) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const { toast } = useUmpanBalik();
  const kode = params.get("pesan") ?? (params.get("baru") === "1" ? "baru" : null);
  const ditangani = useRef<string | null>(null);
  useEffect(() => {
    if (!kode || ditangani.current === kode) return;
    ditangani.current = kode;
    const isi = daftar[kode];
    if (isi) toast(isi.teks, isi.jenis ?? "sukses");
    const sisa = new URLSearchParams(params.toString());
    sisa.delete("pesan");
    sisa.delete("baru");
    const qs = sisa.toString();
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [kode, daftar, params, path, router, toast]);
  return null;
}

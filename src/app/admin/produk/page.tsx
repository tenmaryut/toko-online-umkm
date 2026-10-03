import type { Metadata } from "next";
import Link from "next/link";
import { aktifkanProdukAction } from "@/actions/admin";
import { IkonTambah } from "@/components/ikon";
import { TombolAksi } from "@/components/tombol-aksi";
import { ToastDariUrl } from "@/components/umpan-balik";
import { daftarProdukAdmin } from "@/db/queries";
import { formatRupiah } from "@/lib/format";
import { wajibAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Produk" };

const PESAN: Record<string, string> = {
  ditambahkan: "Produk ditambahkan.",
  diperbarui: "Perubahan produk disimpan.",
  dihapus: "Produk dihapus.",
  diarsipkan: "Produk pernah dipesan, jadi diarsipkan (disembunyikan dari toko), bukan dihapus.",
  "terlalu-cepat": "Terlalu banyak perubahan dalam waktu singkat. Tunggu sebentar.",
};

export default async function AdminProduk({ searchParams }: PageProps<"/admin/produk">) {
  await wajibAdmin();
  const daftar = daftarProdukAdmin();
  const { pesan } = await searchParams;
  const pesanTeks = typeof pesan === "string" ? PESAN[pesan] : undefined;

  return (
    <div className="space-y-5">
      <ToastDariUrl
        daftar={Object.fromEntries(
          Object.entries(PESAN).map(([k, teks]) => [k, { teks, jenis: k === "terlalu-cepat" ? ("galat" as const) : k === "diarsipkan" ? ("info" as const) : ("sukses" as const) }]),
        )}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Produk</h1>
          <p className="mt-1 text-sm text-arang-2">
            {daftar.length} produk · {daftar.filter((p) => p.isActive).length} aktif
          </p>
        </div>
        <Link href="/admin/produk/baru" className="tombol-utama">
          <IkonTambah ukuran={18} /> Tambah produk
        </Link>
      </div>
      {pesanTeks && (
        <p role="status" className="rounded-2xl bg-lumut-muda px-4 py-3 text-sm font-medium text-lumut-tua">
          {pesanTeks}
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {daftar.map((p) => (
          <li key={p.id} className={`kartu flex gap-4 p-3 ${p.isActive ? "" : "opacity-75"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- gambar kecil */}
            <img src={p.imagePath} alt="" width={80} height={80} className="size-20 shrink-0 rounded-xl bg-kertas-2 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-arang-2">{p.categoryName}</p>
              <Link href={`/admin/produk/${p.id}`} className="font-display font-semibold leading-snug hover:underline">
                {p.name}
              </Link>
              <p className="mt-1 text-sm">
                <span className="font-semibold">{formatRupiah(p.price)}</span>
                <span className={`ml-2 ${p.stock === 0 ? "text-bahaya" : p.stock <= 5 ? "text-tanah-tua" : "text-arang-2"}`}>
                  Stok {p.stock}
                </span>
                <span className="ml-2 text-arang-2">Terjual {p.soldCount}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!p.isActive && <span className="rounded-full bg-kertas-3 px-2 py-0.5 text-xs font-semibold">Diarsipkan</span>}
                {p.isFeatured && <span className="rounded-full bg-kunyit-muda px-2 py-0.5 text-xs font-semibold">Pilihan</span>}
                <Link href={`/admin/produk/${p.id}`} className="tombol-teks min-h-9">
                  Ubah
                </Link>
                <form action={aktifkanProdukAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <TombolAksi className="tombol-teks min-h-9 text-arang-2">{p.isActive ? "Arsipkan" : "Aktifkan"}</TombolAksi>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

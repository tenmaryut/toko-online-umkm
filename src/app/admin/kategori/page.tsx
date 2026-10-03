import type { Metadata } from "next";
import Link from "next/link";
import { hapusKategoriAction } from "@/actions/admin";
import { FormKategori } from "@/components/admin/form-kategori";
import { TombolAksi } from "@/components/tombol-aksi";
import { ToastDariUrl } from "@/components/umpan-balik";
import { daftarKategoriAdmin } from "@/db/queries";
import { wajibAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Kategori" };

const PESAN: Record<string, string> = {
  dihapus: "Kategori dihapus.",
  "masih-dipakai": "Kategori masih berisi produk. Pindahkan atau hapus produknya dulu.",
};

export default async function AdminKategori({ searchParams }: PageProps<"/admin/kategori">) {
  await wajibAdmin();
  const daftar = daftarKategoriAdmin();
  const { pesan } = await searchParams;
  const pesanTeks = typeof pesan === "string" ? PESAN[pesan] : undefined;

  return (
    <div className="space-y-6">
      <ToastDariUrl
        daftar={{
          dihapus: { teks: PESAN.dihapus! },
          "masih-dipakai": { teks: PESAN["masih-dipakai"]!, jenis: "galat" },
        }}
      />
      <h1 className="font-display text-3xl font-semibold tracking-tight">Kategori</h1>
      {pesanTeks && (
        <p role="status" className="rounded-2xl bg-kunyit-muda px-4 py-3 text-sm font-medium">
          {pesanTeks}
        </p>
      )}
      <section aria-labelledby="judul-tambah-kategori" className="kartu p-5">
        <h2 id="judul-tambah-kategori" className="font-display text-lg font-semibold">
          Tambah kategori
        </h2>
        <div className="mt-4">
          <FormKategori />
        </div>
      </section>
      <section aria-labelledby="judul-daftar-kategori" className="space-y-3">
        <h2 id="judul-daftar-kategori" className="font-display text-lg font-semibold">
          Daftar kategori ({daftar.length})
        </h2>
        {daftar.map((k) => (
          <details key={k.id} className="kartu group p-4">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
              <span>
                <span className="font-semibold">{k.name}</span>
                <span className="ml-2 font-mono text-xs text-arang-2">/{k.slug}</span>
              </span>
              <span className="text-sm text-arang-2">
                {k.jumlahProduk} produk · <span className="font-semibold text-tanah group-open:hidden">Ubah</span>
                <span className="hidden font-semibold text-tanah group-open:inline">Tutup</span>
              </span>
            </summary>
            <div className="mt-4 space-y-4 border-t border-garis pt-4">
              <FormKategori kategori={k} />
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href={`/kategori/${k.slug}`} className="tombol-teks min-h-9">
                  Lihat di toko
                </Link>
                <form action={hapusKategoriAction}>
                  <input type="hidden" name="id" value={k.id} />
                  <TombolAksi className="tombol-teks min-h-9 text-bahaya" konfirmasi={`Hapus kategori ${k.name}?`}>
                    Hapus kategori
                  </TombolAksi>
                </form>
                {k.jumlahProduk > 0 && <span className="text-xs text-arang-2">Hanya kategori kosong yang bisa dihapus.</span>}
              </div>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

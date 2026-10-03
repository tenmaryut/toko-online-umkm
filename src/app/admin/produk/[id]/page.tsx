import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hapusProdukAction } from "@/actions/admin";
import { FormProduk } from "@/components/admin/form-produk";
import { TombolAksi } from "@/components/tombol-aksi";
import { ambilProdukAdmin, daftarKategoriAdmin } from "@/db/queries";
import { wajibAdmin } from "@/lib/session";
import { skemaIdAngka } from "@/lib/validation";

export const metadata: Metadata = { title: "Ubah produk" };

export default async function AdminUbahProduk({ params }: PageProps<"/admin/produk/[id]">) {
  await wajibAdmin();
  const id = skemaIdAngka.safeParse((await params).id);
  if (!id.success) notFound();
  const produk = ambilProdukAdmin(id.data);
  if (!produk) notFound();
  const kategori = daftarKategoriAdmin().map((k) => ({ id: k.id, name: k.name }));

  return (
    <div className="space-y-5">
      <Link href="/admin/produk" className="tombol-teks">
        ← Semua produk
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Ubah produk</h1>
        <div className="flex flex-wrap gap-2">
          {produk.isActive && (
            <Link href={`/produk/${produk.slug}`} className="tombol-garis">
              Lihat di toko
            </Link>
          )}
          <form action={hapusProdukAction}>
            <input type="hidden" name="id" value={produk.id} />
            <TombolAksi
              className="tombol-bahaya"
              konfirmasi="Hapus produk ini? Produk yang pernah dipesan akan diarsipkan, bukan dihapus."
            >
              Hapus
            </TombolAksi>
          </form>
        </div>
      </div>
      <FormProduk produk={produk} kategori={kategori} />
    </div>
  );
}

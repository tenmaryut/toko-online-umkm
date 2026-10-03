import type { Metadata } from "next";
import Link from "next/link";
import { FormProduk } from "@/components/admin/form-produk";
import { daftarKategoriAdmin } from "@/db/queries";
import { wajibAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Tambah produk" };

export default async function AdminProdukBaru() {
  await wajibAdmin();
  const kategori = daftarKategoriAdmin().map((k) => ({ id: k.id, name: k.name }));
  return (
    <div className="space-y-5">
      <Link href="/admin/produk" className="tombol-teks">
        ← Semua produk
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Tambah produk</h1>
      <FormProduk kategori={kategori} />
    </div>
  );
}

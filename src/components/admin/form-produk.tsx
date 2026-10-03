"use client";

import { useActionState, useEffect, useState } from "react";
import type { HasilForm } from "@/actions/auth";
import { simpanProdukAction } from "@/actions/admin";
import { Kolom, PesanGalat, TombolKirim } from "../form";

type Produk = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  price: number;
  stock: number;
  weightGrams: number;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  imagePath: string;
};

export function FormProduk({ produk, kategori }: { produk?: Produk; kategori: { id: number; name: string }[] }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(simpanProdukAction, null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [galatBerkas, setGalatBerkas] = useState<string | null>(null);
  // Select dibuat terkontrol: reset form otomatis setelah aksi tidak mengosongkan pilihan kategori.
  const [idKategori, setIdKategori] = useState(produk ? String(produk.categoryId) : "");
  const n = (k: string, cadangan: string | number) => hasil?.nilai?.[k] ?? String(cadangan);
  const g = hasil?.galat ?? {};

  useEffect(() => () => {
    if (pratinjau) URL.revokeObjectURL(pratinjau);
  }, [pratinjau]);

  return (
    <form action={aksi} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]" noValidate>
      {produk && <input type="hidden" name="id" value={produk.id} />}
      <div className="space-y-5">
        <PesanGalat pesan={hasil?.pesan} />
        <Kolom label="Nama produk" name="name" required defaultValue={n("name", produk?.name ?? "")} galat={g.name} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Kolom
            label="Slug (alamat halaman)"
            name="slug"
            defaultValue={n("slug", produk?.slug ?? "")}
            galat={g.slug}
            bantuan="Kosongkan untuk dibuat otomatis dari nama."
          />
          <div>
            <label htmlFor="kolom-categoryId" className="label-form">
              Kategori
            </label>
            <select
              id="kolom-categoryId"
              name="categoryId"
              value={idKategori}
              onChange={(e) => setIdKategori(e.target.value)}
              className="masukan"
              aria-invalid={g.categoryId ? true : undefined}
              aria-describedby={g.categoryId ? "galat-categoryId" : undefined}
            >
              <option value="">Pilih kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            {g.categoryId && (
              <p id="galat-categoryId" className="galat-form">
                {g.categoryId}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Kolom label="Harga (Rp)" name="price" inputMode="numeric" required defaultValue={n("price", produk?.price ?? "")} galat={g.price} />
          <Kolom label="Stok" name="stock" type="number" min={0} required defaultValue={n("stock", produk?.stock ?? 0)} galat={g.stock} />
          <Kolom
            label="Berat (gram)"
            name="weightGrams"
            type="number"
            min={1}
            required
            defaultValue={n("weightGrams", produk?.weightGrams ?? 250)}
            galat={g.weightGrams}
          />
        </div>
        <div>
          <label htmlFor="kolom-description" className="label-form">
            Deskripsi
          </label>
          <textarea
            id="kolom-description"
            name="description"
            rows={5}
            maxLength={2000}
            defaultValue={n("description", produk?.description ?? "")}
            className="masukan"
            aria-invalid={g.description ? true : undefined}
            aria-describedby={g.description ? "galat-description" : undefined}
          />
          {g.description && (
            <p id="galat-description" className="galat-form">
              {g.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={hasil?.nilai ? hasil.nilai.isActive === "on" : (produk?.isActive ?? true)}
              className="size-5 accent-lumut"
            />
            Tampil di toko (aktif)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={hasil?.nilai ? hasil.nilai.isFeatured === "on" : (produk?.isFeatured ?? false)}
              className="size-5 accent-lumut"
            />
            Tampilkan di beranda (pilihan)
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <TombolKirim menunggu="Menyimpan…">{produk ? "Simpan perubahan" : "Tambah produk"}</TombolKirim>
        </div>
      </div>

      <div className="space-y-3">
        <p className="label-form">Gambar produk</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal (blob:) atau gambar yang sudah ada */}
        <img
          src={pratinjau ?? produk?.imagePath ?? "/images/produk-polos.svg"}
          alt={pratinjau ? "Pratinjau gambar baru" : "Gambar produk saat ini"}
          width={600}
          height={600}
          className="aspect-square w-full rounded-2xl border border-garis bg-kertas-2 object-cover"
        />
        <label htmlFor="kolom-gambar" className="label-form">
          Ganti gambar
        </label>
        <input
          id="kolom-gambar"
          name="gambar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="bantuan-gambar"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setGalatBerkas(null);
            if (!f) return setPratinjau(null);
            if (f.size > 2 * 1024 * 1024) {
              setGalatBerkas("Ukuran gambar maksimal 2 MB.");
              e.target.value = "";
              return setPratinjau(null);
            }
            setPratinjau(URL.createObjectURL(f));
          }}
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-lumut file:px-4 file:py-2 file:font-semibold file:text-kertas"
        />
        <p id="bantuan-gambar" className="text-xs text-arang-2">
          JPG, PNG, atau WebP, maks. 2 MB, min. 200 × 200 px. Gambar dipotong persegi dan dikonversi ke WebP; metadata lokasi
          kamera dibuang.
        </p>
        {(galatBerkas || g.gambar) && <p className="galat-form">{galatBerkas ?? g.gambar}</p>}
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import type { HasilForm } from "@/actions/auth";
import { simpanKategoriAction } from "@/actions/admin";
import { Kolom, TombolKirim } from "../form";
import { useToastHasil } from "../umpan-balik";

type Kategori = { id: number; name: string; slug: string; description: string };

/** Form tambah (tanpa `kategori`) atau ubah kategori. */
export function FormKategori({ kategori }: { kategori?: Kategori }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(simpanKategoriAction, null);
  const g = hasil?.galat ?? {};
  const awalan = kategori ? `kat-${kategori.id}` : "kat-baru";
  const n = (k: string, cadangan: string) => hasil?.nilai?.[k] ?? cadangan;
  const sukses = hasil?.pesan && !hasil.galat && !hasil.nilai;
  useToastHasil(sukses ? hasil : null);
  return (
    <form action={aksi} className="space-y-3" noValidate>
      {kategori && <input type="hidden" name="id" value={kategori.id} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Kolom id={`${awalan}-name`} label="Nama" name="name" required defaultValue={n("name", kategori?.name ?? "")} galat={g.name} />
        <Kolom
          id={`${awalan}-slug`}
          label="Slug"
          name="slug"
          defaultValue={n("slug", kategori?.slug ?? "")}
          galat={g.slug}
          bantuan={kategori ? undefined : "Kosongkan untuk dibuat dari nama."}
        />
      </div>
      <Kolom
        id={`${awalan}-description`}
        label="Deskripsi singkat"
        name="description"
        defaultValue={n("description", kategori?.description ?? "")}
        galat={g.description}
      />
      <div className="flex flex-wrap items-center gap-3">
        <TombolKirim menunggu="Menyimpan…" className={kategori ? "tombol-garis" : "tombol-utama"}>
          {kategori ? "Simpan" : "Tambah kategori"}
        </TombolKirim>
        {hasil?.pesan && (
          <p role="status" className={sukses ? "text-sm font-medium text-lumut" : "text-sm font-medium text-bahaya"}>
            {hasil.pesan}
          </p>
        )}
      </div>
    </form>
  );
}

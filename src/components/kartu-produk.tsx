import Link from "next/link";
import type { CSSProperties } from "react";
import type { KartuProduk as DataKartu } from "@/db/queries";
import { formatRupiah } from "@/lib/format";
import { TombolTambahCepat } from "./tombol-keranjang";

export function LabelStok({ stok }: { stok: number }) {
  if (stok <= 0) return <span className="text-xs font-semibold text-bahaya">Stok habis</span>;
  if (stok <= 5) return <span className="text-xs font-semibold text-tanah-tua">Sisa {stok}</span>;
  return <span className="text-xs text-arang-2">Stok {stok}</span>;
}

export function KartuProduk({ produk, prioritas = false }: { produk: DataKartu; prioritas?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-kartu)] border border-garis bg-white/70 transition-shadow hover:shadow-[0_10px_30px_-18px_rgb(36_28_21/0.45)]">
      <div className="relative aspect-square overflow-hidden bg-kertas-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi SVG ringan, tidak perlu optimizer */}
        <img
          src={produk.imagePath}
          alt=""
          width={600}
          height={600}
          loading={prioritas ? "eager" : "lazy"}
          fetchPriority={prioritas ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-focus-within:scale-[1.04] group-hover:scale-[1.04]"
        />
        {produk.stock <= 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-arang/85 px-2.5 py-1 text-xs font-semibold text-kertas">Habis</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-arang-2">{produk.categoryName}</p>
        <h3 className="mt-1 font-display text-[1.02rem] font-semibold leading-snug text-arang">
          <Link href={`/produk/${produk.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {produk.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-base font-bold text-arang">{formatRupiah(produk.price)}</p>
          <LabelStok stok={produk.stock} />
        </div>
        <TombolTambahCepat productId={produk.id} stok={produk.stock} nama={produk.name} />
      </div>
    </article>
  );
}

export function GridProduk({ produk, prioritasPertama = 0 }: { produk: DataKartu[]; prioritasPertama?: number }) {
  return (
    <ul className="muncul-bertahap grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {produk.map((p, i) => (
        <li key={p.id} className="flex" style={{ "--urutan": i } as CSSProperties}>
          <div className="flex w-full flex-col [&>article]:flex-1">
            <KartuProduk produk={p} prioritas={i < prioritasPertama} />
          </div>
        </li>
      ))}
    </ul>
  );
}

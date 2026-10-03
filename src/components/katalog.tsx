import Link from "next/link";
import { ambilKategori, cariProduk } from "@/db/queries";
import { formatAngka, formatRupiah } from "@/lib/format";
import { LABEL_URUTAN, type QueryKatalog, URUTAN_KATALOG } from "@/lib/validation";
import { FormFilter, HasilKatalog, PanelFilter, PenyediaTransisiKatalog, TautanKatalog } from "./form-filter";
import { IkonCari, IkonChevronKanan, IkonChevronKiri } from "./ikon";
import { GridProduk } from "./kartu-produk";

type Props = {
  query: QueryKatalog;
  /** Path dasar form & paginasi: "/produk" atau "/kategori/<slug>". */
  dasar: string;
  /** Pada halaman kategori, pilihan kategori diganti tautan antarkategori. */
  kategoriTetap?: string;
};

function urlDengan(dasar: string, query: QueryKatalog, ubah: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  const nilai: Record<string, string | number | undefined> = {
    q: query.q || undefined,
    kategori: dasar.startsWith("/kategori/") ? undefined : query.kategori,
    min: query.min,
    max: query.max,
    urut: query.urut === "terbaru" ? undefined : query.urut,
    tersedia: query.tersedia ? "1" : undefined,
    hal: query.hal > 1 ? query.hal : undefined,
    ...ubah,
  };
  for (const [k, v] of Object.entries(nilai)) if (v !== undefined && v !== "") p.set(k, String(v));
  const qs = p.toString();
  return qs ? `${dasar}?${qs}` : dasar;
}

/** Nilai filter lain yang ikut dikirim sebagai input tersembunyi. */
function Tersembunyi({ nilai }: { nilai: Record<string, string | number | undefined | false> }) {
  return (
    <>
      {Object.entries(nilai).map(([nama, v]) =>
        v === undefined || v === "" || v === false ? null : <input key={nama} type="hidden" name={nama} value={String(v)} />,
      )}
    </>
  );
}

export function Katalog({ query, dasar, kategoriTetap }: Props) {
  const kategori = ambilKategori();
  const hasil = cariProduk(kategoriTetap ? { ...query, kategori: kategoriTetap } : query);
  const kategoriDipilih = kategoriTetap ? undefined : query.kategori;
  const adaFilter = Boolean(query.q || query.min !== undefined || query.max !== undefined || query.tersedia || kategoriDipilih);

  const ringkasan =
    [
      kategoriDipilih ? kategori.find((k) => k.slug === kategoriDipilih)?.name : null,
      query.min !== undefined ? `≥ ${formatRupiah(query.min)}` : null,
      query.max !== undefined ? `≤ ${formatRupiah(query.max)}` : null,
      query.tersedia ? "tersedia" : null,
    ]
      .filter(Boolean)
      .join(", ") || "semua";

  return (
    <PenyediaTransisiKatalog>
    <div className="wadah grid grid-cols-1 gap-4 pb-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10">
      {/* Pencarian & urutan */}
      <FormFilter action={dasar} className="flex flex-col gap-3 sm:flex-row sm:items-end lg:col-start-2" role="search">
        <div className="relative flex-1">
          <label htmlFor="cari" className="label-form">
            Cari produk
          </label>
          <IkonCari ukuran={18} className="pointer-events-none absolute bottom-3.5 left-3.5 text-arang-2" />
          <input
            id="cari"
            name="q"
            type="search"
            defaultValue={query.q ?? ""}
            placeholder="mis. kopi arabika, sambal"
            className="masukan pl-10"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 sm:w-48 sm:flex-none">
            <label htmlFor="urut" className="label-form">
              Urutkan
            </label>
            <select id="urut" name="urut" defaultValue={query.urut} className="masukan">
              {URUTAN_KATALOG.map((u) => (
                <option key={u} value={u}>
                  {LABEL_URUTAN[u]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="tombol-utama self-end">
            Cari
          </button>
        </div>
        <Tersembunyi nilai={{ kategori: kategoriDipilih, min: query.min, max: query.max, tersedia: query.tersedia && "1" }} />
      </FormFilter>

      {/* Filter: satu form, tampil di kiri pada desktop dan bisa dibuka-tutup di layar kecil */}
      <PanelFilter ringkasan={ringkasan}>
        <FormFilter action={dasar} className="space-y-6" aria-label="Saring produk">
          <Tersembunyi nilai={{ q: query.q, urut: query.urut === "terbaru" ? undefined : query.urut }} />
          {kategoriTetap ? (
            <nav aria-label="Kategori lain">
              <p className="label-form">Kategori</p>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href="/produk" className="block rounded-lg px-2 py-1.5 hover:bg-kertas-2">
                    Semua produk
                  </Link>
                </li>
                {kategori.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/kategori/${k.slug}`}
                      aria-current={k.slug === kategoriTetap ? "page" : undefined}
                      className="flex justify-between rounded-lg px-2 py-1.5 hover:bg-kertas-2 aria-[current=page]:bg-lumut-muda aria-[current=page]:font-semibold"
                    >
                      {k.name} <span className="text-arang-2">{k.jumlahProduk}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <fieldset>
              <legend className="label-form">Kategori</legend>
              <div className="space-y-0.5 text-sm">
                <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-kertas-2">
                  <input type="radio" name="kategori" value="" defaultChecked={!kategoriDipilih} className="size-4 accent-lumut" />
                  Semua kategori
                </label>
                {kategori.map((k) => (
                  <label key={k.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-kertas-2">
                    <input
                      type="radio"
                      name="kategori"
                      value={k.slug}
                      defaultChecked={kategoriDipilih === k.slug}
                      className="size-4 accent-lumut"
                    />
                    <span className="flex-1">{k.name}</span>
                    <span className="text-arang-2">{k.jumlahProduk}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend className="label-form">Rentang harga (Rp)</legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="harga-min" className="sr-only">
                  Harga minimum
                </label>
                <input
                  id="harga-min"
                  name="min"
                  inputMode="numeric"
                  placeholder="Min"
                  defaultValue={query.min ?? ""}
                  className="masukan py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="harga-max" className="sr-only">
                  Harga maksimum
                </label>
                <input
                  id="harga-max"
                  name="max"
                  inputMode="numeric"
                  placeholder="Maks"
                  defaultValue={query.max ?? ""}
                  className="masukan py-2 text-sm"
                />
              </div>
            </div>
          </fieldset>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="tersedia" value="1" defaultChecked={query.tersedia} className="size-4 accent-lumut" />
            Hanya yang tersedia
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="tombol-lumut">
              Terapkan
            </button>
            {adaFilter && (
              <Link href={dasar} className="tombol-teks">
                Hapus filter
              </Link>
            )}
          </div>
        </FormFilter>
      </PanelFilter>

      {/* Hasil: skeleton selama transisi, lalu grid baru muncul bertahap */}
      <div className="min-w-0 lg:col-start-2">
        <HasilKatalog kunci={urlDengan(dasar, query, {})}>
        <p className="mt-2 text-sm text-arang-2" aria-live="polite">
          {hasil.total === 0
            ? "Tidak ada produk yang cocok."
            : `Menampilkan ${formatAngka(hasil.items.length)} dari ${formatAngka(hasil.total)} produk${query.q ? ` untuk “${query.q}”` : ""}.`}
        </p>
        <div className="mt-4">
          {hasil.items.length > 0 ? (
            <GridProduk produk={hasil.items} prioritasPertama={2} />
          ) : (
            <div className="rounded-[var(--radius-kartu)] border border-dashed border-arang/25 px-6 py-14 text-center">
              <p className="font-display text-xl font-semibold">Belum ketemu yang dicari</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-arang-2">
                Coba kata kunci lain, perlebar rentang harga, atau lihat semua produk.
              </p>
              <Link href={dasar} className="tombol-garis mt-5">
                Hapus semua filter
              </Link>
            </div>
          )}
        </div>
        {hasil.jumlahHalaman > 1 && (
          <nav aria-label="Halaman katalog" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {hasil.halaman > 1 && (
              <TautanKatalog href={urlDengan(dasar, query, { hal: hasil.halaman - 1 })} className="tombol-garis" rel="prev">
                <IkonChevronKiri ukuran={18} /> Sebelumnya
              </TautanKatalog>
            )}
            <span className="px-3 text-sm text-arang-2">
              Halaman {hasil.halaman} dari {hasil.jumlahHalaman}
            </span>
            {hasil.halaman < hasil.jumlahHalaman && (
              <TautanKatalog href={urlDengan(dasar, query, { hal: hasil.halaman + 1 })} className="tombol-garis" rel="next">
                Berikutnya <IkonChevronKanan ukuran={18} />
              </TautanKatalog>
            )}
          </nav>
        )}
        </HasilKatalog>
      </div>
    </div>
    </PenyediaTransisiKatalog>
  );
}

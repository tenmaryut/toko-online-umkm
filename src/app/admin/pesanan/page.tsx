import type { Metadata } from "next";
import Link from "next/link";
import { IkonChevronKanan, IkonChevronKiri } from "@/components/ikon";
import { LencanaStatus } from "@/components/status-pesanan";
import { daftarPesananAdmin, jumlahPesananPerStatus } from "@/db/queries";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import { samarkanNama } from "@/lib/mask";
import { LABEL_STATUS, STATUS_PESANAN } from "@/lib/order-status";
import { adminDemo, wajibAdmin } from "@/lib/session";
import { skemaFilterPesananAdmin } from "@/lib/validation";

export const metadata: Metadata = { title: "Pesanan" };

export default async function AdminPesanan({ searchParams }: PageProps<"/admin/pesanan">) {
  const sesi = await wajibAdmin();
  const demo = adminDemo(sesi);
  const filter = skemaFilterPesananAdmin.parse(await searchParams);
  const hasil = daftarPesananAdmin(filter);
  const perStatus = jumlahPesananPerStatus();
  const semua = [...perStatus.values()].reduce((a, b) => a + b, 0);
  const url = (ubah: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const nilai = { status: filter.status, q: filter.q, ...ubah };
    for (const [k, v] of Object.entries(nilai)) if (v !== undefined && v !== "" && !(k === "hal" && String(v) === "1")) p.set(k, String(v));
    return p.size ? `/admin/pesanan?${p}` : "/admin/pesanan";
  };
  const nama = (n: string, isDemo: boolean) => (demo && !isDemo ? samarkanNama(n) : n);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Pesanan</h1>

      <nav aria-label="Saring status pesanan">
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <li>
            <Link
              href={url({ status: undefined, hal: undefined })}
              aria-current={!filter.status ? "page" : undefined}
              className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-arang/15 bg-white/60 px-3 text-sm hover:border-lumut aria-[current=page]:border-lumut aria-[current=page]:bg-lumut aria-[current=page]:text-kertas"
            >
              Semua <span className="opacity-75">{semua}</span>
            </Link>
          </li>
          {STATUS_PESANAN.map((s) => (
            <li key={s}>
              <Link
                href={url({ status: s, hal: undefined })}
                aria-current={filter.status === s ? "page" : undefined}
                className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-arang/15 bg-white/60 px-3 text-sm hover:border-lumut aria-[current=page]:border-lumut aria-[current=page]:bg-lumut aria-[current=page]:text-kertas"
              >
                {LABEL_STATUS[s]} <span className="opacity-75">{perStatus.get(s) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form action="/admin/pesanan" className="flex max-w-md gap-2" role="search">
        {filter.status && <input type="hidden" name="status" value={filter.status} />}
        <label htmlFor="cari-kode" className="sr-only">
          Cari kode pesanan
        </label>
        <input id="cari-kode" name="q" defaultValue={filter.q ?? ""} placeholder="Cari kode, mis. LK2610" className="masukan py-2" />
        <button type="submit" className="tombol-lumut">
          Cari
        </button>
      </form>

      {hasil.items.length === 0 ? (
        <p className="kartu px-5 py-10 text-center text-arang-2">Tidak ada pesanan untuk filter ini.</p>
      ) : (
        <>
          {/* Tabel di layar lebar */}
          <div className="kartu hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Daftar pesanan</caption>
              <thead className="bg-kertas-2/70 text-arang-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kode
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Pelanggan
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tujuan
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tanggal
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {hasil.items.map((p) => (
                  <tr key={p.id} className="hover:bg-kertas-2/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pesanan/${p.code}`} className="font-mono font-semibold text-tanah hover:underline">
                        {p.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {nama(p.customerName, p.customerIsDemo)}
                      <span className="block text-xs text-arang-2">{p.jumlahItem} barang</span>
                    </td>
                    <td className="px-4 py-3 text-arang-2">
                      {p.city}, {p.province}
                    </td>
                    <td className="px-4 py-3 text-arang-2">{formatTanggalJam(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <LencanaStatus status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Kartu di layar kecil */}
          <ul className="space-y-3 md:hidden">
            {hasil.items.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/pesanan/${p.code}`} className="kartu block p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-tanah">{p.code}</span>
                    <LencanaStatus status={p.status} />
                  </span>
                  <span className="mt-2 flex justify-between gap-2 text-sm">
                    <span>{nama(p.customerName, p.customerIsDemo)}</span>
                    <span className="font-semibold">{formatRupiah(p.total)}</span>
                  </span>
                  <span className="mt-1 block text-xs text-arang-2">
                    {formatTanggalJam(p.createdAt)} · {p.city}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasil.jumlahHalaman > 1 && (
        <nav aria-label="Halaman pesanan" className="flex flex-wrap items-center gap-2">
          {hasil.halaman > 1 && (
            <Link href={url({ hal: hasil.halaman - 1 })} className="tombol-garis">
              <IkonChevronKiri ukuran={18} /> Sebelumnya
            </Link>
          )}
          <span className="px-2 text-sm text-arang-2">
            Halaman {hasil.halaman} dari {hasil.jumlahHalaman}
          </span>
          {hasil.halaman < hasil.jumlahHalaman && (
            <Link href={url({ hal: hasil.halaman + 1 })} className="tombol-garis">
              Berikutnya <IkonChevronKanan ukuran={18} />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

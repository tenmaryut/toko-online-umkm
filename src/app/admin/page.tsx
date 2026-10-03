import Link from "next/link";
import { AngkaNaik } from "@/components/admin/angka-naik";
import { GrafikPenjualan } from "@/components/admin/grafik-penjualan";
import { IkonPanahKanan, IkonPeringatan } from "@/components/ikon";
import { LencanaStatus } from "@/components/status-pesanan";
import { penjualanHarian, pesananTerbaru, ringkasanDashboard, stokMenipis } from "@/db/queries";
import { samarkanNama } from "@/lib/mask";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import { adminDemo, wajibAdmin } from "@/lib/session";

export default async function DasborAdmin() {
  const sesi = await wajibAdmin();
  const demo = adminDemo(sesi);
  const r = ringkasanDashboard();
  const harian = penjualanHarian(14);
  const terbaru = pesananTerbaru(6);
  const menipis = stokMenipis(5);

  const kpi = [
    { label: "Pendapatan 30 hari", nilai: r.pendapatan30Hari, jenis: "rupiah" },
    { label: "Pesanan dibayar 30 hari", nilai: r.pesanan30Hari, jenis: "angka" },
    { label: "Rata-rata nilai pesanan", nilai: r.rataRata, jenis: "rupiah" },
    { label: "Pelanggan baru 30 hari", nilai: r.pelangganBaru, jenis: "angka" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Ringkasan</h1>
          <p className="mt-1 text-sm text-arang-2">Angka berasal dari data demo dan pesanan pengunjung hari ini.</p>
        </div>
        <Link href="/admin/pesanan?status=dibayar" className="tombol-lumut">
          {r.perluDiproses} pesanan perlu diproses <IkonPanahKanan ukuran={18} />
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className="kartu p-4">
            <dt className="text-sm text-arang-2">{k.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              <AngkaNaik nilai={k.nilai} jenis={k.jenis} />
            </dd>
          </div>
        ))}
      </dl>

      <GrafikPenjualan data={harian} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="judul-terbaru" className="kartu overflow-hidden">
          <div className="flex items-center justify-between border-b border-garis px-5 py-3">
            <h2 id="judul-terbaru" className="font-display text-lg font-semibold">
              Pesanan terbaru
            </h2>
            <Link href="/admin/pesanan" className="tombol-teks min-h-0">
              Semua <IkonPanahKanan ukuran={16} />
            </Link>
          </div>
          <ul className="divide-y divide-garis">
            {terbaru.map((p) => (
              <li key={p.code}>
                <Link href={`/admin/pesanan/${p.code}`} className="block px-5 py-3 text-sm hover:bg-kertas-2/60">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono font-semibold">{p.code}</span>
                    <LencanaStatus status={p.status} />
                    <span className="ml-auto font-semibold tabular-nums">{formatRupiah(p.total)}</span>
                  </span>
                  <span className="mt-1 block text-xs text-arang-2">
                    {demo && !p.customerIsDemo ? samarkanNama(p.customerName) : p.customerName} · {formatTanggalJam(p.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="judul-stok" className="kartu h-fit p-5">
          <h2 id="judul-stok" className="flex items-center gap-2 font-display text-lg font-semibold">
            <IkonPeringatan ukuran={18} /> Stok menipis
          </h2>
          {menipis.length === 0 ? (
            <p className="mt-2 text-sm text-arang-2">Semua stok aman.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {menipis.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/produk/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                  <span className={`shrink-0 font-semibold ${p.stock === 0 ? "text-bahaya" : "text-tanah-tua"}`}>
                    {p.stock === 0 ? "Habis" : `Sisa ${p.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

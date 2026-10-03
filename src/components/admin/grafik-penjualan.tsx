import type { CSSProperties } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";

type Titik = { tanggal: string; total: number; jumlah: number };

const ringkas = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

/** Kelipatan "rapi" untuk sumbu Y (1, 2, 2.5, 5 × 10^n). */
function langkahRapi(maks: number, jumlahGaris = 4): number {
  if (maks <= 0) return 1;
  const kasar = maks / jumlahGaris;
  const pangkat = 10 ** Math.floor(Math.log10(kasar));
  const pilihan = [1, 2, 2.5, 5, 10].map((k) => k * pangkat);
  return pilihan.find((p) => p >= kasar) ?? 10 * pangkat;
}

/**
 * Grafik kolom pendapatan harian (satu seri, satu warna). HTML/CSS murni sehingga teks tetap
 * tajam di layar kecil. Tooltip muncul saat hover maupun fokus keyboard, dan nilai yang sama
 * tersedia di tabel data.
 */
export function GrafikPenjualan({ data }: { data: Titik[] }) {
  const maksData = Math.max(0, ...data.map((d) => d.total));
  const langkah = langkahRapi(maksData);
  const atas = Math.max(langkah, Math.ceil(maksData / langkah) * langkah);
  const garis = Array.from({ length: Math.round(atas / langkah) + 1 }, (_, i) => i * langkah);
  const indeksTertinggi = data.findIndex((d) => d.total === maksData && maksData > 0);
  const tanggal = (t: string) => formatTanggalPendek(new Date(`${t}T12:00:00+07:00`));

  return (
    <figure className="kartu p-5">
      <figcaption>
        <h2 className="font-display text-lg font-semibold">Pendapatan harian, 14 hari terakhir</h2>
        <p className="text-sm text-arang-2">Pesanan berstatus dibayar, dikemas, dikirim, atau selesai (Rp).</p>
      </figcaption>

      <div className="relative mt-6 h-56 sm:h-64">
        {/* garis bantu + label sumbu Y */}
        {garis.map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-garis" style={{ bottom: `${(g / atas) * 100}%` }} aria-hidden="true">
            <span className="absolute -top-2.5 left-0 w-12 pr-2 text-right text-[0.7rem] tabular-nums text-arang-2">
              {g === 0 ? "0" : ringkas.format(g)}
            </span>
          </div>
        ))}
        <ol className="absolute inset-y-0 left-12 right-0 flex items-end gap-0.5" aria-label="Pendapatan per hari">
          {data.map((d, i) => {
            const tinggi = atas > 0 ? (d.total / atas) * 100 : 0;
            const label = `${tanggal(d.tanggal)}: ${formatRupiah(d.total)}, ${d.jumlah} pesanan`;
            return (
              <li key={d.tanggal} className="flex h-full flex-1">
                <div
                  tabIndex={0}
                  role="img"
                  aria-label={label}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center rounded-md outline-offset-0 focus-visible:bg-lumut-muda/50"
                >
                <div
                  className="batang-tumbuh w-full max-w-6 origin-bottom rounded-t-[4px] bg-[#4f7f45] transition-[filter] group-hover:brightness-110 group-focus-visible:brightness-110"
                  data-testid="batang-grafik"
                  style={{ height: d.total > 0 ? `max(${tinggi}%, 2px)` : "0", "--urutan": i } as CSSProperties}
                />
                {i === indeksTertinggi && (
                  <span
                    className="pointer-events-none absolute whitespace-nowrap text-[0.7rem] font-semibold text-arang group-hover:opacity-0 group-focus-visible:opacity-0"
                    style={{ bottom: `calc(${tinggi}% + 4px)` }}
                    aria-hidden="true"
                  >
                    {ringkas.format(d.total)}
                  </span>
                )}
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute z-10 w-max rounded-lg bg-arang px-2.5 py-1.5 text-xs text-kertas opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
                    i < 3 ? "left-0" : i > data.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                  style={{ bottom: `calc(${Math.min(tinggi, 78)}% + 10px)` }}
                >
                  <strong className="block text-sm">{formatRupiah(d.total)}</strong>
                  {tanggal(d.tanggal)} · {d.jumlah} pesanan
                </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {/* label sumbu X: tiap hari di layar lebar, tiap tiga hari (dihitung dari hari ini) di layar kecil */}
      <ol className="ml-12 mt-2 flex h-4 gap-0.5 text-[0.68rem] text-arang-2" aria-hidden="true">
        {data.map((d, i) => (
          <li key={d.tanggal} className="relative min-w-0 flex-1">
            <span
              className={`absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap ${(data.length - 1 - i) % 3 === 0 ? "" : "hidden md:inline"}`}
            >
              {tanggal(d.tanggal)}
            </span>
          </li>
        ))}
      </ol>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-tanah">Lihat tabel data</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[18rem] text-left">
            <caption className="sr-only">Pendapatan dan jumlah pesanan per hari</caption>
            <thead>
              <tr className="border-b border-garis text-arang-2">
                <th scope="col" className="py-1.5 pr-4 font-semibold">
                  Tanggal
                </th>
                <th scope="col" className="py-1.5 pr-4 text-right font-semibold">
                  Pendapatan
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  Pesanan
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {data.map((d) => (
                <tr key={d.tanggal} className="border-b border-garis/60">
                  <th scope="row" className="py-1.5 pr-4 font-normal">
                    {tanggal(d.tanggal)}
                  </th>
                  <td className="py-1.5 pr-4 text-right">{formatRupiah(d.total)}</td>
                  <td className="py-1.5 text-right">{d.jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

import type { Metadata } from "next";
import { daftarPelanggan } from "@/db/queries";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { samarkanEmail, samarkanNama } from "@/lib/mask";
import { adminDemo, wajibAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Pelanggan" };

export default async function AdminPelanggan() {
  const sesi = await wajibAdmin();
  const demo = adminDemo(sesi);
  const daftar = daftarPelanggan().map((p) => {
    const samar = demo && !p.isDemo;
    return { ...p, name: samar ? samarkanNama(p.name) : p.name, email: samar ? samarkanEmail(p.email) : p.email, samar };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Pelanggan</h1>
        <p className="mt-1 text-sm text-arang-2">
          {daftar.length} pelanggan. Akun bertanda “contoh” adalah data demo; akun lain didaftarkan pengunjung dan dihapus tiap malam.
        </p>
      </div>
      <div className="kartu hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Daftar pelanggan</caption>
          <thead className="bg-kertas-2/70 text-arang-2">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nama
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Bergabung
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Pesanan
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Total belanja
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {daftar.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  {p.name}
                  {p.isDemo && <span className="ml-2 rounded-full bg-kertas-3 px-2 py-0.5 text-xs">contoh</span>}
                </td>
                <td className="px-4 py-3 text-arang-2">{p.email}</td>
                <td className="px-4 py-3 text-arang-2">{formatTanggal(p.createdAt)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{p.jumlahPesanan}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(p.totalBelanja)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {daftar.map((p) => (
          <li key={p.id} className="kartu p-4 text-sm">
            <p className="flex items-center justify-between gap-2 font-semibold">
              {p.name}
              {p.isDemo && <span className="rounded-full bg-kertas-3 px-2 py-0.5 text-xs font-normal">contoh</span>}
            </p>
            <p className="break-all text-arang-2">{p.email}</p>
            <p className="mt-2 flex justify-between">
              <span className="text-arang-2">
                {p.jumlahPesanan} pesanan · sejak {formatTanggal(p.createdAt)}
              </span>
              <span className="font-semibold">{formatRupiah(p.totalBelanja)}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

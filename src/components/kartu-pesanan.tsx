import Link from "next/link";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import type { StatusPesanan } from "@/lib/order-status";
import { IkonChevronKanan } from "./ikon";
import { LencanaStatus } from "./status-pesanan";

type Ringkas = {
  code: string;
  status: StatusPesanan;
  total: number;
  createdAt: Date;
  items: { productName: string; quantity: number }[];
};

export function DaftarPesananPelanggan({ pesanan }: { pesanan: Ringkas[] }) {
  return (
    <ul className="divide-y divide-garis overflow-hidden rounded-[var(--radius-kartu)] border border-garis bg-white/70">
      {pesanan.map((p) => {
        const jumlah = p.items.reduce((t, i) => t + i.quantity, 0);
        return (
          <li key={p.code}>
            <Link href={`/akun/pesanan/${p.code}`} className="flex items-center gap-4 p-4 hover:bg-kertas-2/60" data-testid="pesanan-saya">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{p.code}</span>
                  <LencanaStatus status={p.status} />
                </div>
                <p className="mt-1 truncate text-sm text-arang-2">
                  {p.items[0]?.productName}
                  {p.items.length > 1 ? ` dan ${p.items.length - 1} produk lain` : ""} · {jumlah} barang
                </p>
                <p className="mt-0.5 text-xs text-arang-2">{formatTanggalJam(p.createdAt)}</p>
              </div>
              <span className="text-right font-bold">{formatRupiah(p.total)}</span>
              <IkonChevronKanan ukuran={18} className="shrink-0 text-arang-2" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

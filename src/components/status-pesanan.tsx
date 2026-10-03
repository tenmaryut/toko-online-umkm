import type { CSSProperties } from "react";
import { formatTanggalJam } from "@/lib/format";
import { LABEL_STATUS, LANGKAH_PESANAN, type StatusPesanan } from "@/lib/order-status";
import { IkonCentang } from "./ikon";

const WARNA: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "bg-kunyit-muda text-arang ring-kunyit/60",
  dibayar: "bg-lumut-muda text-lumut-tua ring-lumut/30",
  dikemas: "bg-[#e1e9ef] text-[#1f3f57] ring-[#1f3f57]/20",
  dikirim: "bg-tanah-muda text-tanah-tua ring-tanah/30",
  selesai: "bg-lumut text-kertas ring-lumut",
  dibatalkan: "bg-kertas-3 text-arang-2 ring-arang/15",
};

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${WARNA[status]}`}
      data-status={status}
    >
      {LABEL_STATUS[status]}
    </span>
  );
}

type Riwayat = { status: StatusPesanan; createdAt: Date; note: string };

/** Linimasa status pesanan untuk pelanggan dan admin. */
export function Linimasa({ status, riwayat }: { status: StatusPesanan; riwayat: Riwayat[] }) {
  if (status === "dibatalkan") {
    return (
      <ol className="space-y-3">
        {riwayat.map((r, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-arang-2" aria-hidden="true" />
            <span>
              <span className="font-semibold">{LABEL_STATUS[r.status]}</span>
              <span className="block text-arang-2">
                {formatTanggalJam(r.createdAt)}
                {r.note ? ` · ${r.note}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
    );
  }
  const posisi = LANGKAH_PESANAN.indexOf(status);
  return (
    <ol className="relative space-y-5" data-testid="linimasa">
      {LANGKAH_PESANAN.map((langkah, i) => {
        const tercatat = [...riwayat].reverse().find((r) => r.status === langkah);
        const selesai = i <= posisi;
        const urutan = { "--urutan": i } as CSSProperties;
        return (
          <li key={langkah} className="relative flex gap-3">
            {i < LANGKAH_PESANAN.length - 1 && (
              <span aria-hidden="true" className="absolute left-[0.8rem] top-7 h-[calc(100%-0.5rem)] w-0.5 bg-garis">
                {i < posisi && <span className="garis-tumbuh absolute inset-0 origin-top bg-lumut" style={urutan} />}
              </span>
            )}
            <span aria-hidden="true" className="relative z-10 grid size-7 shrink-0 place-items-center">
              {i === posisi && status !== "selesai" && <span className="denyut absolute inset-0 rounded-full text-lumut" />}
              <span
                className={`relative grid size-7 place-items-center rounded-full border-2 ${
                  selesai ? "titik-muncul border-lumut bg-lumut text-kertas" : "border-garis bg-kertas text-arang-2"
                }`}
                style={selesai ? urutan : undefined}
              >
                {selesai ? <IkonCentang ukuran={14} /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
            </span>
            <span className="text-sm">
              <span className={selesai ? "font-semibold" : "text-arang-2"}>
                {LABEL_STATUS[langkah]}
                <span className="sr-only">{selesai ? " (sudah)" : " (belum)"}</span>
              </span>
              {tercatat && <span className="block text-arang-2">{formatTanggalJam(tercatat.createdAt)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

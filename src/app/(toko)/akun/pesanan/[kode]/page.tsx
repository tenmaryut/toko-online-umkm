import { createHash } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { batalkanPesananAction, bayarSimulasiAction } from "@/actions/pesanan";
import { IkonCentang, IkonInfo } from "@/components/ikon";
import { RincianPesanan } from "@/components/rincian-pesanan";
import { LencanaStatus, Linimasa } from "@/components/status-pesanan";
import { TombolAksi } from "@/components/tombol-aksi";
import { ToastDariUrl } from "@/components/umpan-balik";
import { ambilPesananByKode } from "@/db/queries";
import { formatRupiah, formatTanggalJam } from "@/lib/format";
import { wajibLogin } from "@/lib/session";
import { skemaKodePesanan } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Detail pesanan",
  robots: { index: false, follow: false },
};

/** Nomor "virtual account" palsu yang stabil per pesanan (jelas ditandai simulasi). */
function nomorVaSimulasi(kode: string) {
  const angka = BigInt(`0x${createHash("sha256").update(kode).digest("hex").slice(0, 14)}`).toString().padStart(12, "0").slice(0, 12);
  return `8808 ${angka.slice(0, 4)} ${angka.slice(4, 8)} ${angka.slice(8, 12)}`;
}

/** Pola kotak mirip QR yang sengaja tidak bisa dipindai (hanya ilustrasi). */
function PolaQrPalsu({ kode }: { kode: string }) {
  const hash = createHash("sha256").update(kode).digest();
  const sel: string[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const pojok = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (pojok) continue;
      const bit = (hash[(y * 21 + x) % 32]! >> ((x + y) % 8)) & 1;
      if (bit) sel.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const penanda = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg viewBox="-1 -1 23 23" className="size-36 rounded-lg bg-white p-1" aria-hidden="true">
      <path d={`${penanda(0, 0)}${penanda(14, 0)}${penanda(0, 14)}`} fill="#241c15" fillRule="evenodd" />
      <path d={sel.join("")} fill="#241c15" />
    </svg>
  );
}

export default async function HalamanDetailPesanan({ params, searchParams }: PageProps<"/akun/pesanan/[kode]">) {
  const { kode: kodeMentah } = await params;
  const sesi = await wajibLogin(`/akun/pesanan/${encodeURIComponent(kodeMentah)}`);
  const kode = skemaKodePesanan.safeParse(kodeMentah);
  if (!kode.success) notFound();
  const pesanan = await ambilPesananByKode(kode.data);
  // Pesanan milik orang lain diperlakukan sama dengan tidak ada (tidak membocorkan keberadaannya).
  if (!pesanan || pesanan.userId !== sesi.user.id) notFound();
  const { baru, pesan } = await searchParams;
  const PESAN_INLINE: Record<string, string> = {
    dibayar: "Pembayaran simulasi berhasil. Pesanan sudah dibayar.",
    dibatalkan: "Pesanan dibatalkan dan stok dikembalikan.",
    gagal: "Perubahan status tidak bisa dilakukan untuk pesanan ini.",
  };
  const pesanInline = typeof pesan === "string" ? PESAN_INLINE[pesan] : undefined;

  return (
    <div className="wadah max-w-5xl py-10 sm:py-14">
      <ToastDariUrl
        daftar={{
          baru: { teks: "Pesanan dibuat. Selesaikan pembayaran simulasinya." },
          dibayar: { teks: "Pembayaran simulasi berhasil. Pesanan dibayar." },
          dibatalkan: { teks: "Pesanan dibatalkan; stok dikembalikan.", jenis: "info" },
          gagal: { teks: "Perubahan status tidak bisa dilakukan.", jenis: "galat" },
        }}
      />
      <Link href="/akun/pesanan" className="tombol-teks">
        ← Semua pesanan
      </Link>
      {baru === "1" && pesanan.status === "menunggu_pembayaran" && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-2xl bg-lumut-muda px-4 py-3 text-sm font-semibold text-lumut-tua">
          <IkonCentang ukuran={18} /> Pesanan berhasil dibuat. Stok sudah dipesankan untuk Anda.
        </p>
      )}
      {pesanInline && (
        <p role="status" className="mt-4 rounded-2xl bg-lumut-muda px-4 py-3 text-sm font-semibold text-lumut-tua">
          {pesanInline}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Pesanan <span className="font-mono text-2xl" data-testid="kode-pesanan">{pesanan.code}</span>
        </h1>
        <LencanaStatus status={pesanan.status} />
      </div>
      <p className="mt-1 text-sm text-arang-2">Dibuat {formatTanggalJam(pesanan.createdAt)}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          {pesanan.status === "menunggu_pembayaran" && (
            <section aria-labelledby="judul-bayar-simulasi" className="rounded-[var(--radius-kartu)] border-2 border-kunyit bg-kunyit-muda/70 p-5">
              <h2 id="judul-bayar-simulasi" className="font-display text-xl font-semibold">
                Selesaikan pembayaran (simulasi)
              </h2>
              <p className="mt-1 text-sm">
                Total yang harus dibayar: <strong>{formatRupiah(pesanan.total)}</strong>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-5">
                {pesanan.paymentMethod === "qris" ? (
                  <div className="flex flex-col items-center gap-1">
                    <PolaQrPalsu kode={pesanan.code} />
                    <span className="text-xs text-arang-2">Ilustrasi, bukan kode QR asli</span>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs text-arang-2">
                      {pesanan.paymentMethod === "transfer_va" ? "Nomor virtual account (simulasi)" : "Kode bayar dompet digital (simulasi)"}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tracking-wider">{nomorVaSimulasi(pesanan.code)}</p>
                  </div>
                )}
                <p className="flex max-w-xs gap-2 text-sm text-arang-2">
                  <IkonInfo ukuran={18} className="mt-0.5 shrink-0" />
                  Jangan transfer uang sungguhan. Tekan tombol di bawah untuk mensimulasikan pembayaran berhasil.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <form action={bayarSimulasiAction}>
                  <input type="hidden" name="code" value={pesanan.code} />
                  <TombolAksi className="tombol-utama">Bayar sekarang (simulasi)</TombolAksi>
                </form>
                <form action={batalkanPesananAction}>
                  <input type="hidden" name="code" value={pesanan.code} />
                  <TombolAksi className="tombol-bahaya" konfirmasi="Batalkan pesanan ini? Stok akan dikembalikan.">
                    Batalkan pesanan
                  </TombolAksi>
                </form>
              </div>
            </section>
          )}
          <RincianPesanan pesanan={pesanan} />
        </div>

        <aside aria-labelledby="judul-status" className="kartu h-fit p-5">
          <h2 id="judul-status" className="font-display text-lg font-semibold">
            Status pesanan
          </h2>
          <div className="mt-4">
            <Linimasa status={pesanan.status} riwayat={pesanan.history} />
          </div>
          {pesanan.status === "dikirim" && (
            <p className="mt-4 text-xs text-arang-2">Pengiriman hanya simulasi; tidak ada nomor resi kurir sungguhan.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

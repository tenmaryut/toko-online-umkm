import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ubahStatusPesananAction } from "@/actions/admin";
import { IkonInfo } from "@/components/ikon";
import { RincianPesanan } from "@/components/rincian-pesanan";
import { LencanaStatus, Linimasa } from "@/components/status-pesanan";
import { TombolAksi } from "@/components/tombol-aksi";
import { ToastDariUrl } from "@/components/umpan-balik";
import { ambilPesananByKode } from "@/db/queries";
import { formatTanggalJam } from "@/lib/format";
import { samarkanAlamat, samarkanEmail, samarkanNama, samarkanTelepon } from "@/lib/mask";
import { LABEL_AKSI_ADMIN, LABEL_STATUS, STATUS_PESANAN, transisiBerikutnya } from "@/lib/order-status";
import { adminDemo, wajibAdmin } from "@/lib/session";
import { skemaKodePesanan } from "@/lib/validation";

export const metadata: Metadata = { title: "Detail pesanan" };

const PESAN: Record<string, string> = {
  "tidak-diizinkan": "Perubahan status itu tidak diizinkan dari status saat ini.",
  "terlalu-cepat": "Terlalu banyak perubahan dalam waktu singkat. Tunggu sebentar.",
};

const TOAST_STATUS = {
  ...Object.fromEntries(STATUS_PESANAN.map((s) => [`status-${s}`, { teks: `Status pesanan diubah: ${LABEL_STATUS[s]}.` }])),
  "tidak-diizinkan": { teks: PESAN["tidak-diizinkan"]!, jenis: "galat" as const },
  "terlalu-cepat": { teks: PESAN["terlalu-cepat"]!, jenis: "galat" as const },
};

export default async function AdminDetailPesanan({ params, searchParams }: PageProps<"/admin/pesanan/[kode]">) {
  const sesi = await wajibAdmin();
  const kode = skemaKodePesanan.safeParse((await params).kode);
  if (!kode.success) notFound();
  const pesanan = await ambilPesananByKode(kode.data);
  if (!pesanan) notFound();
  const { pesan } = await searchParams;
  const pesanTeks = typeof pesan === "string" ? PESAN[pesan] : undefined;

  // Admin demo melihat data pribadi pelanggan non-demo dalam bentuk tersamar.
  const samarkan = adminDemo(sesi) && !pesanan.user.isDemo;
  const tampil = samarkan
    ? {
        ...pesanan,
        recipientName: samarkanNama(pesanan.recipientName),
        phone: samarkanTelepon(pesanan.phone),
        addressLine: samarkanAlamat(pesanan.addressLine),
        postalCode: "•••••",
        note: pesanan.note ? "[catatan disamarkan]" : "",
      }
    : pesanan;
  const berikutnya = transisiBerikutnya(pesanan.status, "admin");

  return (
    <div className="space-y-6">
      <ToastDariUrl daftar={TOAST_STATUS} />
      <Link href="/admin/pesanan" className="tombol-teks">
        ← Semua pesanan
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          <span className="font-mono text-2xl">{pesanan.code}</span>
        </h1>
        <LencanaStatus status={pesanan.status} />
      </div>
      <p className="text-sm text-arang-2">
        Dibuat {formatTanggalJam(pesanan.createdAt)} oleh{" "}
        <strong className="text-arang">{samarkan ? samarkanNama(pesanan.user.name) : pesanan.user.name}</strong> (
        {samarkan ? samarkanEmail(pesanan.user.email) : pesanan.user.email})
      </p>

      {pesanTeks && (
        <p role="alert" className="rounded-2xl border border-bahaya/30 bg-bahaya-muda px-4 py-3 text-sm font-medium text-bahaya">
          {pesanTeks}
        </p>
      )}

      <section aria-labelledby="judul-ubah-status" className="kartu p-5">
        <h2 id="judul-ubah-status" className="font-display text-lg font-semibold">
          Ubah status
        </h2>
        {berikutnya.length === 0 ? (
          <p className="mt-2 text-sm text-arang-2">Pesanan ini sudah {LABEL_STATUS[pesanan.status].toLowerCase()}; tidak ada langkah berikutnya.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-arang-2">Alur: dibayar → dikemas → dikirim → selesai. Pembatalan sebelum dikirim mengembalikan stok.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {berikutnya.map((ke) => (
                <form key={ke} action={ubahStatusPesananAction}>
                  <input type="hidden" name="code" value={pesanan.code} />
                  <input type="hidden" name="status" value={ke} />
                  <TombolAksi
                    className={ke === "dibatalkan" ? "tombol-bahaya" : "tombol-utama"}
                    konfirmasi={ke === "dibatalkan" ? "Batalkan pesanan ini? Stok dikembalikan bila barang belum dikirim." : undefined}
                  >
                    {LABEL_AKSI_ADMIN[ke]}
                  </TombolAksi>
                </form>
              ))}
            </div>
          </>
        )}
        {pesanan.status === "menunggu_pembayaran" && (
          <p className="mt-4 flex gap-2 text-xs text-arang-2">
            <IkonInfo ukuran={16} className="shrink-0" /> Pelanggan bisa menekan tombol bayar simulasi sendiri; admin juga boleh menandai dibayar
            (mis. konfirmasi transfer manual).
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <RincianPesanan pesanan={tampil} tautanProduk={false} />
        <aside aria-labelledby="judul-riwayat" className="kartu h-fit p-5">
          <h2 id="judul-riwayat" className="font-display text-lg font-semibold">
            Riwayat status
          </h2>
          <div className="mt-4">
            <Linimasa status={pesanan.status} riwayat={pesanan.history} />
          </div>
        </aside>
      </div>
    </div>
  );
}

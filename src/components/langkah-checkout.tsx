import { IkonCentang } from "./ikon";

export type StatusLangkah = { alamat: boolean; pengiriman: boolean; pembayaran: boolean };

const LANGKAH = ["Alamat", "Pengiriman", "Pembayaran", "Konfirmasi"] as const;

/** Indikator langkah checkout dengan bilah progres (transform: scaleX) yang terisi saat bagian form lengkap. */
export function LangkahCheckout({ status }: { status: StatusLangkah }) {
  const selesai = [status.alamat, status.pengiriman, status.pembayaran];
  const jumlahSelesai = selesai.filter(Boolean).length;
  const aktif = jumlahSelesai === 3 ? 3 : selesai.findIndex((s) => !s);
  return (
    <nav aria-label="Langkah checkout" className="kartu p-4 sm:p-5" data-testid="langkah-checkout">
      <div className="relative">
        {/* Bilah progres di belakang lingkaran langkah (dari pusat langkah 1 ke pusat langkah 4). */}
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-garis" aria-hidden="true">
          <div
            className="progres-isi absolute inset-0 origin-left rounded-full bg-lumut"
            data-testid="progres-checkout"
            style={{ transform: `scaleX(${jumlahSelesai / 3})` }}
          />
        </div>
        <ol className="relative grid grid-cols-4 gap-1 text-center">
          {LANGKAH.map((label, i) => {
            const beres = i < 3 ? selesai[i] : jumlahSelesai === 3;
            return (
              <li key={label} aria-current={i === aktif ? "step" : undefined} className="flex flex-col items-center gap-1.5">
                <span
                  key={beres ? "beres" : "belum"}
                  className={`grid size-8 place-items-center rounded-full border-2 text-sm font-bold ${
                    beres
                      ? "langkah-aktif border-lumut bg-lumut text-kertas"
                      : i === aktif
                        ? "border-tanah bg-tanah-muda text-tanah-tua"
                        : "border-garis bg-kertas text-arang-2"
                  }`}
                >
                  {beres ? <IkonCentang ukuran={16} /> : i + 1}
                </span>
                <span className={`text-xs sm:text-sm ${beres || i === aktif ? "font-semibold text-arang" : "text-arang-2"}`}>
                  {label}
                  <span className="sr-only">{beres ? " (lengkap)" : i === aktif ? " (sedang diisi)" : ""}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="sr-only" aria-live="polite">
        {jumlahSelesai} dari 3 bagian lengkap.
      </p>
    </nav>
  );
}

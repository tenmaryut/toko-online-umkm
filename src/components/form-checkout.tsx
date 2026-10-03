"use client";

import { useActionState, useRef, useState } from "react";
import type { HasilForm } from "@/actions/auth";
import { buatPesananAction } from "@/actions/pesanan";
import { formatRupiah } from "@/lib/format";
import { LABEL_PEMBAYARAN, METODE_PEMBAYARAN } from "@/lib/order-status";
import { LAYANAN_IDS, type LayananId, NAMA_PROVINSI, pilihanPengiriman, ZONA, zonaUntukProvinsi } from "@/lib/shipping";
import { normalkanHp, POLA_HP, POLA_KODE_POS } from "@/lib/pola";
import { Kolom, KolomJebakan, PeringatanDemo, PesanGalat, TombolKirim } from "./form";
import { LangkahCheckout, type StatusLangkah } from "./langkah-checkout";

type Item = { id: number; nama: string; jumlah: number; total: number; gambar: string };

function alamatLengkap(n: (k: string) => string) {
  return (
    n("recipientName").trim().length >= 3 &&
    POLA_HP.test(normalkanHp(n("phone"))) &&
    n("addressLine").trim().length >= 10 &&
    n("city").trim().length >= 3 &&
    zonaUntukProvinsi(n("province")) !== null &&
    POLA_KODE_POS.test(n("postalCode").trim())
  );
}
type Bawaan = Partial<Record<"recipientName" | "phone" | "addressLine" | "city" | "province" | "postalCode", string>>;

export function FormCheckout({ item, subtotal, bawaan }: { item: Item[]; subtotal: number; bawaan: Bawaan }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(buatPesananAction, null);
  const [provinsi, setProvinsi] = useState(bawaan.province ?? "");
  const [layanan, setLayanan] = useState<LayananId>("reguler");
  const zona = zonaUntukProvinsi(provinsi);
  const pilihan = zona ? pilihanPengiriman(zona) : [];
  const ongkir = zona ? (pilihan.find((p) => p.layanan === layanan)?.biaya ?? 0) : null;
  const n = (k: keyof Bawaan) => hasil?.nilai?.[k] ?? bawaan[k] ?? "";
  const g = hasil?.galat ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [alamatOk, setAlamatOk] = useState(() => alamatLengkap((k) => (bawaan as Record<string, string | undefined>)[k] ?? ""));
  const status: StatusLangkah = { alamat: alamatOk, pengiriman: zona !== null, pembayaran: true };
  const periksa = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setAlamatOk(alamatLengkap((k) => String(data.get(k) ?? "")));
  };

  return (
    <form ref={formRef} action={aksi} onInput={periksa} onChange={periksa} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" noValidate>
      <div className="space-y-8">
        <LangkahCheckout status={status} />
        <PeringatanDemo />
        <PesanGalat pesan={hasil?.pesan} />
        <KolomJebakan />

        <fieldset className="space-y-5">
          <legend className="font-display text-xl font-semibold">1. Alamat pengiriman</legend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Kolom label="Nama penerima" name="recipientName" autoComplete="name" required defaultValue={n("recipientName")} galat={g.recipientName} />
            <Kolom
              label="Nomor HP"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              defaultValue={n("phone")}
              galat={g.phone}
              bantuan="Contoh fiktif: 081234567890"
            />
          </div>
          <Kolom
            label="Alamat lengkap"
            name="addressLine"
            autoComplete="street-address"
            required
            defaultValue={n("addressLine")}
            galat={g.addressLine}
            bantuan="Nama jalan, nomor, RT/RW. Gunakan alamat contoh."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Kolom label="Kota/kabupaten" name="city" autoComplete="address-level2" required defaultValue={n("city")} galat={g.city} className="sm:col-span-1" />
            <div>
              <label htmlFor="kolom-province" className="label-form">
                Provinsi
              </label>
              <select
                id="kolom-province"
                name="province"
                required
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                aria-invalid={g.province ? true : undefined}
                aria-describedby={g.province ? "galat-province" : undefined}
                className="masukan"
              >
                <option value="">Pilih provinsi</option>
                {NAMA_PROVINSI.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {g.province && (
                <p id="galat-province" className="galat-form">
                  {g.province}
                </p>
              )}
            </div>
            <Kolom
              label="Kode pos"
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              required
              defaultValue={n("postalCode")}
              galat={g.postalCode}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl font-semibold">2. Pengiriman</legend>
          <p className="mt-1 text-sm text-arang-2">
            {zona ? `Tujuan termasuk ${ZONA[zona].nama} (${ZONA[zona].wilayah}). Ongkir tetap, tidak bergantung berat.` : "Pilih provinsi dulu untuk melihat ongkir."}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LAYANAN_IDS.map((l) => {
              const opsi = pilihan.find((p) => p.layanan === l);
              return (
                <label
                  key={l}
                  className="flex cursor-pointer gap-3 rounded-2xl border border-garis bg-white/70 p-4 has-[:checked]:border-lumut has-[:checked]:bg-lumut-muda/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tanah"
                >
                  <input
                    type="radio"
                    name="shippingService"
                    value={l}
                    checked={layanan === l}
                    onChange={() => setLayanan(l)}
                    className="mt-1 size-4 accent-lumut"
                  />
                  <span className="flex-1 text-sm">
                    <span className="flex justify-between gap-2 font-semibold">
                      {l === "reguler" ? "Reguler" : "Kilat"}
                      <span>{opsi ? formatRupiah(opsi.biaya) : "–"}</span>
                    </span>
                    <span className="mt-0.5 block text-arang-2">{opsi ? `Estimasi ${opsi.estimasi}` : "Menunggu provinsi"}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {g.shippingService && <p className="galat-form">{g.shippingService}</p>}
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl font-semibold">3. Pembayaran (simulasi)</legend>
          <p className="mt-1 text-sm text-arang-2">Tidak ada gateway pembayaran sungguhan. Setelah pesanan dibuat, Anda menekan tombol bayar simulasi.</p>
          <div className="mt-4 grid gap-3">
            {METODE_PEMBAYARAN.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-garis bg-white/70 p-4 text-sm has-[:checked]:border-lumut has-[:checked]:bg-lumut-muda/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tanah"
              >
                <input type="radio" name="paymentMethod" value={m} defaultChecked={(hasil?.nilai?.paymentMethod ?? METODE_PEMBAYARAN[0]) === m} className="size-4 accent-lumut" />
                <span className="font-medium">{LABEL_PEMBAYARAN[m]}</span>
              </label>
            ))}
          </div>
          {g.paymentMethod && <p className="galat-form">{g.paymentMethod}</p>}
        </fieldset>

        <div>
          <label htmlFor="kolom-note" className="label-form">
            Catatan untuk penjual <span className="font-normal text-arang-2">(opsional)</span>
          </label>
          <textarea
            id="kolom-note"
            name="note"
            rows={3}
            maxLength={300}
            defaultValue={hasil?.nilai?.note ?? ""}
            className="masukan"
            aria-invalid={g.note ? true : undefined}
          />
          {g.note && <p className="galat-form">{g.note}</p>}
        </div>
      </div>

      <aside aria-labelledby="judul-ringkasan-checkout" className="kartu h-fit p-5 lg:sticky lg:top-32">
        <h2 id="judul-ringkasan-checkout" className="font-display text-xl font-semibold">
          Ringkasan pesanan
        </h2>
        <ul className="mt-4 space-y-3">
          {item.map((i) => (
            <li key={i.id} className="flex gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- ilustrasi kecil */}
              <img src={i.gambar} alt="" width={48} height={48} className="size-12 rounded-lg bg-kertas-2 object-cover" />
              <span className="flex-1">
                {i.nama}
                <span className="block text-arang-2">× {i.jumlah}</span>
              </span>
              <span className="font-semibold">{formatRupiah(i.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-garis pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatRupiah(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Ongkir {zona ? `(${ZONA[zona].nama}, ${layanan === "kilat" ? "Kilat" : "Reguler"})` : ""}</dt>
            <dd data-testid="ongkir-checkout">{ongkir === null ? "–" : formatRupiah(ongkir)}</dd>
          </div>
          <div className="flex justify-between border-t border-garis pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd data-testid="total-checkout">{formatRupiah(subtotal + (ongkir ?? 0))}</dd>
          </div>
        </dl>
        <TombolKirim menunggu="Membuat pesanan…" className="tombol-utama mt-5 w-full">
          Buat pesanan
        </TombolKirim>
        <p className="mt-3 text-xs text-arang-2">Stok dikurangi saat pesanan dibuat. Pesanan yang belum dibayar bisa dibatalkan.</p>
      </aside>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { daftarAction, type HasilForm, masukAction } from "@/actions/auth";
import { AKUN_DEMO } from "@/lib/site";
import { Kolom, KolomJebakan, PeringatanDemo, PesanGalat, TombolKirim } from "./form";

export function FormMasuk({ kembali }: { kembali?: string }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(masukAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  function isiAkun(email: string, password: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    (form.elements.namedItem("password") as HTMLInputElement).value = password;
    (form.elements.namedItem("password") as HTMLInputElement).focus();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form ref={formRef} action={aksi} className="space-y-5" noValidate>
        <PesanGalat pesan={hasil?.pesan} />
        <input type="hidden" name="kembali" value={kembali ?? ""} />
        <KolomJebakan />
        <Kolom
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={hasil?.nilai?.email}
          galat={hasil?.galat?.email}
        />
        <Kolom
          label="Kata sandi"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          galat={hasil?.galat?.password}
        />
        <TombolKirim menunggu="Memeriksa…" className="tombol-utama w-full sm:w-auto sm:px-10">
          Masuk
        </TombolKirim>
        <p className="text-sm text-arang-2">
          Belum punya akun?{" "}
          <Link href={kembali ? `/daftar?kembali=${encodeURIComponent(kembali)}` : "/daftar"} className="font-semibold text-tanah underline-offset-4 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>

      <aside aria-labelledby="judul-akun-demo" className="rounded-[var(--radius-kartu)] border border-garis bg-lumut-muda/60 p-5">
        <h2 id="judul-akun-demo" className="font-display text-lg font-semibold">
          Akun demo
        </h2>
        <p className="mt-1 text-sm text-arang-2">Boleh dipakai siapa saja. Data demo direset setiap pukul 00.00 WIB.</p>
        {(
          [
            ["Pelanggan demo", AKUN_DEMO.pelanggan],
            ["Admin demo", AKUN_DEMO.admin],
          ] as const
        ).map(([judul, akun]) => (
          <div key={judul} className="mt-4 rounded-2xl border border-garis bg-white/80 p-4">
            <p className="font-semibold">{judul}</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div>
                <dt className="sr-only">Email</dt>
                <dd className="break-all font-mono text-[0.82rem]">{akun.email}</dd>
              </div>
              <div>
                <dt className="sr-only">Kata sandi</dt>
                <dd className="font-mono text-[0.82rem]">{akun.password}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => isiAkun(akun.email, akun.password)} className="tombol-garis mt-3 w-full">
              Isi otomatis: {judul.toLowerCase()}
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}

export function FormDaftar({ kembali }: { kembali?: string }) {
  const [hasil, aksi] = useActionState<HasilForm, FormData>(daftarAction, null);
  return (
    <form action={aksi} className="space-y-5" noValidate>
      <PeringatanDemo />
      <PesanGalat pesan={hasil?.pesan} />
      <input type="hidden" name="kembali" value={kembali ?? ""} />
      <KolomJebakan />
      <Kolom label="Nama" name="name" autoComplete="name" required defaultValue={hasil?.nilai?.name} galat={hasil?.galat?.name} />
      <Kolom
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={hasil?.nilai?.email}
        galat={hasil?.galat?.email}
        bantuan="Boleh memakai alamat fiktif, mis. nama@contoh.test. Email tidak pernah dikirimi pesan."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Kolom
          label="Kata sandi"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          galat={hasil?.galat?.password}
          bantuan="Minimal 8 karakter."
        />
        <Kolom
          label="Ulangi kata sandi"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          galat={hasil?.galat?.confirmPassword}
        />
      </div>
      <div>
        <label className="flex cursor-pointer gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={hasil?.galat?.consent ? true : undefined}
            aria-describedby={hasil?.galat?.consent ? "galat-consent" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-lumut"
          />
          <span>
            Saya paham ini toko demo: tidak ada transaksi nyata, saya tidak memasukkan data pribadi asli, dan akun beserta datanya
            dihapus otomatis setiap malam. Lihat{" "}
            <Link href="/privasi" className="font-semibold text-tanah underline underline-offset-2">
              kebijakan privasi
            </Link>
            .
          </span>
        </label>
        {hasil?.galat?.consent && (
          <p id="galat-consent" className="galat-form">
            {hasil.galat.consent}
          </p>
        )}
      </div>
      <TombolKirim menunggu="Mendaftarkan…" className="tombol-utama w-full sm:w-auto sm:px-10">
        Buat akun
      </TombolKirim>
      <p className="text-sm text-arang-2">
        Sudah punya akun?{" "}
        <Link href={kembali ? `/masuk?kembali=${encodeURIComponent(kembali)}` : "/masuk"} className="font-semibold text-tanah underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}

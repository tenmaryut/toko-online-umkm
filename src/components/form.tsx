"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { SITUS } from "@/lib/site";
import { IkonInfo, IkonPeringatan } from "./ikon";

type PropsKolom = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  galat?: string;
  bantuan?: ReactNode;
};

/** Kolom isian berlabel dengan pesan galat yang terhubung lewat aria-describedby. */
export function Kolom({ label, name, galat, bantuan, id, className, ...props }: PropsKolom) {
  const idKolom = id ?? `kolom-${name}`;
  const idBantuan = bantuan ? `${idKolom}-bantuan` : undefined;
  const idGalat = galat ? `${idKolom}-galat` : undefined;
  return (
    <div className={className}>
      <label htmlFor={idKolom} className="label-form">
        {label}
      </label>
      <input
        id={idKolom}
        name={name}
        aria-invalid={galat ? true : undefined}
        aria-describedby={[idBantuan, idGalat].filter(Boolean).join(" ") || undefined}
        className="masukan"
        {...props}
      />
      {bantuan && (
        <p id={idBantuan} className="mt-1.5 text-xs text-arang-2">
          {bantuan}
        </p>
      )}
      {galat && (
        <p id={idGalat} className="galat-form">
          {galat}
        </p>
      )}
    </div>
  );
}

export function TombolKirim({ children, menunggu, className = "tombol-utama" }: { children: ReactNode; menunggu: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? menunggu : children}
    </button>
  );
}

/** Kolom jebakan (honeypot) anti-spam. */
export function KolomJebakan() {
  return (
    <div className="kolom-jebakan" aria-hidden="true">
      <label htmlFor="kolom-website">Jangan isi kolom ini</label>
      <input id="kolom-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export function PeringatanDemo() {
  return (
    <p className="flex gap-2.5 rounded-2xl border border-kunyit/60 bg-kunyit-muda px-4 py-3 text-sm text-arang">
      <IkonInfo ukuran={18} className="mt-0.5 shrink-0" />
      <span>{SITUS.peringatanForm}</span>
    </p>
  );
}

export function PesanGalat({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="flex gap-2.5 rounded-2xl border border-bahaya/30 bg-bahaya-muda px-4 py-3 text-sm font-medium text-bahaya">
      <IkonPeringatan ukuran={18} className="mt-0.5 shrink-0" />
      <span>{pesan}</span>
    </p>
  );
}

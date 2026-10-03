"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Tombol submit kecil yang nonaktif selama aksi server berjalan. */
export function TombolAksi({
  children,
  className,
  label,
  konfirmasi,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  konfirmasi?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (konfirmasi && !window.confirm(konfirmasi)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

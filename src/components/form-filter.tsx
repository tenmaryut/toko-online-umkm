"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { IkonChevronKanan } from "./ikon";

/**
 * Transisi katalog: pencarian, filter, urutan, dan paginasi dinavigasi di dalam transition,
 * sehingga selama data baru dimuat hasil diganti skeleton. Tanpa JavaScript semuanya tetap
 * berupa form GET dan tautan biasa.
 */
type Konteks = { memuat: boolean; navigasi: (url: string, gulirKeAtas?: boolean) => void };
const KonteksKatalog = createContext<Konteks | null>(null);

export function PenyediaTransisiKatalog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [memuat, mulai] = useTransition();
  const navigasi = useCallback(
    (url: string, gulirKeAtas = false) => mulai(() => router.push(url, { scroll: gulirKeAtas })),
    [router],
  );
  const nilai = useMemo(() => ({ memuat, navigasi }), [memuat, navigasi]);
  return <KonteksKatalog.Provider value={nilai}>{children}</KonteksKatalog.Provider>;
}

function useKatalog() {
  return useContext(KonteksKatalog);
}

/** Form GET katalog. Pilihan urutan, kategori, dan kotak centang langsung diterapkan saat berubah. */
export function FormFilter({ action, ...props }: Omit<ComponentProps<"form">, "action" | "method"> & { action: string }) {
  const katalog = useKatalog();
  const kirim = (form: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === "string" && v.trim() !== "") params.append(k, v.trim());
    const qs = params.toString();
    katalog?.navigasi(qs ? `${action}?${qs}` : action);
  };
  return (
    <form
      {...props}
      action={action}
      method="get"
      onSubmit={(e) => {
        if (!katalog) return;
        e.preventDefault();
        kirim(e.currentTarget);
      }}
      onChange={(e) => {
        const t: EventTarget = e.target;
        if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && (t.type === "radio" || t.type === "checkbox"))) {
          if (katalog) kirim(e.currentTarget);
          else e.currentTarget.requestSubmit();
        }
      }}
    />
  );
}

/** Tautan paginasi katalog yang ikut memakai transisi + skeleton. */
export function TautanKatalog({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const katalog = useKatalog();
  return (
    <Link
      {...props}
      href={href}
      onClick={(e) => {
        if (!katalog || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        katalog.navigasi(href, true);
      }}
    />
  );
}

/** Area hasil: skeleton selama memuat; hasil baru dipasang ulang (kunci berubah) agar animasi muncul berulang. */
export function HasilKatalog({ kunci, children }: { kunci: string; children: ReactNode }) {
  const memuat = useKatalog()?.memuat ?? false;
  return (
    <div aria-busy={memuat} data-memuat={memuat ? "ya" : undefined}>
      {memuat ? <KerangkaGrid /> : <div key={kunci}>{children}</div>}
    </div>
  );
}

export function KerangkaGrid({ jumlah = 8 }: { jumlah?: number }) {
  return (
    <div data-testid="kerangka-katalog">
      <p className="sr-only" role="status">
        Memuat produk…
      </p>
      <div className="mt-2 h-5 w-56 max-w-full rounded-full kerangka" aria-hidden="true" />
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: jumlah }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-[var(--radius-kartu)] border border-garis bg-white/70">
            <div className="kerangka aspect-square" />
            <div className="space-y-2.5 p-3 sm:p-4">
              <div className="kerangka h-3 w-1/3 rounded-full" />
              <div className="kerangka h-4 w-5/6 rounded-full" />
              <div className="kerangka h-4 w-1/2 rounded-full" />
              <div className="kerangka mt-3 h-11 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Panel filter: selalu tampil di desktop, bisa dibuka-tutup di layar kecil. */
export function PanelFilter({ children, ringkasan }: { children: ReactNode; ringkasan: string }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={buka}
        aria-controls="panel-filter"
        onClick={() => setBuka((b) => !b)}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-garis bg-white/60 px-4 text-left text-sm font-semibold lg:hidden"
      >
        <span>
          Saring produk <span className="font-normal text-arang-2">· {ringkasan}</span>
        </span>
        <IkonChevronKanan ukuran={18} className={`transition-transform ${buka ? "rotate-90" : ""}`} />
      </button>
      <div
        id="panel-filter"
        className={`${buka ? "block" : "hidden"} rounded-2xl border border-garis bg-white/60 p-4 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:block lg:self-start lg:border-0 lg:bg-transparent lg:p-0`}
      >
        {children}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { keluarAction } from "@/actions/auth";
import { NavAdmin } from "@/components/admin/nav-admin";
import { IkonInfo, IkonKeluar, IkonToko } from "@/components/ikon";
import { TandaLumbung } from "@/components/logo";
import { TombolAksi } from "@/components/tombol-aksi";
import { PenyediaUmpanBalik } from "@/components/umpan-balik";
import { ringkasanDashboard } from "@/db/queries";
import { adminDemo, wajibAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dasbor admin", template: "%s · Admin Lumbung Kabut" },
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  // Penjaga di server: hanya admin yang bisa merender seluruh area /admin.
  const sesi = await wajibAdmin();
  const demo = adminDemo(sesi);
  const { perluDiproses } = ringkasanDashboard();

  return (
    <PenyediaUmpanBalik>
    <div className="flex-1 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:bg-[linear-gradient(to_right,var(--color-lumut-tua)_15.5rem,transparent_15.5rem)]">
      <aside className="bg-lumut-tua text-kertas lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 lg:block lg:px-5 lg:pt-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <TandaLumbung ukuran={34} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">Lumbung Kabut</span>
              <span className="block text-xs uppercase tracking-[0.14em] text-kertas/75">Dasbor admin</span>
            </span>
          </Link>
          <form action={keluarAction} className="lg:hidden">
            <TombolAksi className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-kertas hover:bg-kertas/10">
              <IkonKeluar ukuran={18} /> Keluar
            </TombolAksi>
          </form>
        </div>
        <div className="px-3 pb-3 lg:mt-6 lg:flex-1 lg:px-4">
          <NavAdmin perluDiproses={perluDiproses} />
        </div>
        <div className="hidden space-y-2 border-t border-kertas/15 p-4 text-sm lg:block">
          <p className="truncate font-semibold">{sesi.user.name}</p>
          <p className="truncate text-xs text-kertas/75">{sesi.user.email}</p>
          <Link href="/" className="flex min-h-10 items-center gap-2 rounded-xl px-2 hover:bg-kertas/10">
            <IkonToko ukuran={18} /> Lihat toko
          </Link>
          <form action={keluarAction}>
            <TombolAksi className="flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-kertas/10">
              <IkonKeluar ukuran={18} /> Keluar
            </TombolAksi>
          </form>
        </div>
      </aside>
      <main id="konten" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        {demo && (
          <p className="mb-6 flex gap-2.5 rounded-2xl border border-kunyit/60 bg-kunyit-muda px-4 py-3 text-sm">
            <IkonInfo ukuran={18} className="mt-0.5 shrink-0" />
            <span>
              Anda masuk sebagai <strong>admin demo</strong>. Data pribadi pelanggan yang mendaftar sendiri ditampilkan tersamar,
              dan semua perubahan dikembalikan otomatis pukul 00.00 WIB.
            </span>
          </p>
        )}
        {children}
      </main>
    </div>
    </PenyediaUmpanBalik>
  );
}

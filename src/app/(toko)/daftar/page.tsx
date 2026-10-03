import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormDaftar } from "@/components/form-auth";
import { ambilSesi } from "@/lib/session";
import { tujuanAman } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Daftar akun",
  description: "Buat akun pelanggan di Lumbung Kabut (toko demo). Data dihapus otomatis setiap malam.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/daftar" },
};

export default async function HalamanDaftar({ searchParams }: PageProps<"/daftar">) {
  const { kembali } = await searchParams;
  const tujuan = typeof kembali === "string" ? tujuanAman(kembali, "") : "";
  if (await ambilSesi()) redirect(tujuan || "/akun");

  return (
    <div className="wadah max-w-2xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Daftar akun pelanggan</h1>
      <p className="mt-2 text-arang-2">Akun dipakai untuk checkout dan melihat riwayat pesanan.</p>
      <div className="mt-8">
        <FormDaftar kembali={tujuan || undefined} />
      </div>
    </div>
  );
}

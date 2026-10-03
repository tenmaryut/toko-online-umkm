import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormMasuk } from "@/components/form-auth";
import { ambilSesi } from "@/lib/session";
import { tujuanAman } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun pelanggan atau admin Lumbung Kabut (toko demo).",
  robots: { index: false, follow: true },
  alternates: { canonical: "/masuk" },
};

export default async function HalamanMasuk({ searchParams }: PageProps<"/masuk">) {
  const { kembali } = await searchParams;
  const tujuan = typeof kembali === "string" ? tujuanAman(kembali, "") : "";
  const sesi = await ambilSesi();
  if (sesi) redirect(tujuan || (sesi.user.role === "admin" ? "/admin" : "/akun"));

  return (
    <div className="wadah max-w-4xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Masuk</h1>
      <p className="mt-2 text-arang-2">
        {tujuan === "/checkout" ? "Masuk dulu untuk melanjutkan checkout." : "Masuk untuk melihat pesanan atau membuka dasbor admin."}
      </p>
      <div className="mt-8">
        <FormMasuk kembali={tujuan || undefined} />
      </div>
    </div>
  );
}

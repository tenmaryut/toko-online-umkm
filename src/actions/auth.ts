"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { buatRateLimiter, formatTunggu, ipKlien } from "@/lib/rate-limit";
import { formKeObjek, galatPerKolom, skemaDaftar, skemaMasuk, tujuanAman } from "@/lib/validation";

export type HasilForm = {
  pesan?: string;
  galat?: Record<string, string>;
  nilai?: Record<string, string>;
  /** Penanda waktu hasil sukses, untuk memicu toast sekali. */
  waktu?: number;
} | null;

// Rate limit login: per IP (menahan penebakan massal) dan per IP+email (menahan tebakan satu akun).
const batasLoginIp = buatRateLimiter({ batas: 30, jendelaMs: 15 * 60_000 });
const batasLoginAkun = buatRateLimiter({ batas: 5, jendelaMs: 15 * 60_000 });
const batasDaftarIp = buatRateLimiter({ batas: 5, jendelaMs: 60 * 60_000 });

export async function masukAction(_sebelum: HasilForm, formData: FormData): Promise<HasilForm> {
  const data = formKeObjek(formData);
  const nilai = { email: data.email ?? "", kembali: data.kembali ?? "" };
  // Honeypot: manusia tidak melihat kolom ini; bot pengisi otomatis biasanya mengisinya.
  if (data.website) return { pesan: "Permintaan tidak dapat diproses.", nilai };

  const hasil = skemaMasuk.safeParse(data);
  if (!hasil.success) return { galat: galatPerKolom(hasil.error), nilai };

  const h = await headers();
  const ip = ipKlien(h);
  const kunciAkun = `${ip}:${hasil.data.email}`;
  const cekIp = batasLoginIp.cek(ip);
  const cekAkun = batasLoginAkun.cek(kunciAkun);
  if (!cekIp.ok || !cekAkun.ok) {
    const tunggu = Math.max(cekIp.cobaLagiDalamMs, cekAkun.cobaLagiDalamMs);
    return { pesan: `Terlalu banyak percobaan masuk. Coba lagi dalam ${formatTunggu(tunggu)}.`, nilai };
  }

  let peran = "customer";
  try {
    const masuk = await getAuth().api.signInEmail({
      body: { email: hasil.data.email, password: hasil.data.password },
      headers: h,
    });
    peran = (masuk.user as { role?: string }).role ?? "customer";
    batasLoginAkun.reset(kunciAkun);
  } catch (err) {
    if (err instanceof APIError) return { pesan: "Email atau kata sandi salah.", nilai };
    throw err;
  }
  redirect(tujuanAman(hasil.data.kembali, peran === "admin" ? "/admin" : "/akun"));
}

export async function daftarAction(_sebelum: HasilForm, formData: FormData): Promise<HasilForm> {
  const data = formKeObjek(formData);
  const nilai = { name: data.name ?? "", email: data.email ?? "", kembali: data.kembali ?? "" };
  if (data.website) return { pesan: "Permintaan tidak dapat diproses.", nilai };

  const hasil = skemaDaftar.safeParse(data);
  if (!hasil.success) return { galat: galatPerKolom(hasil.error), nilai };

  const h = await headers();
  const cek = batasDaftarIp.cek(ipKlien(h));
  if (!cek.ok) return { pesan: `Terlalu banyak pendaftaran dari jaringan ini. Coba lagi dalam ${formatTunggu(cek.cobaLagiDalamMs)}.`, nilai };

  try {
    await getAuth().api.signUpEmail({
      body: { name: hasil.data.name, email: hasil.data.email, password: hasil.data.password },
      headers: h,
    });
  } catch (err) {
    if (err instanceof APIError) {
      const sudahAda = /exist/i.test(err.message) || err.status === "UNPROCESSABLE_ENTITY";
      return {
        pesan: sudahAda ? "Email ini sudah terdaftar. Silakan masuk." : "Pendaftaran gagal. Periksa kembali isian Anda.",
        nilai,
      };
    }
    throw err;
  }
  redirect(tujuanAman(hasil.data.kembali, "/akun"));
}

export async function keluarAction(): Promise<void> {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/");
}

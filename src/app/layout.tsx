import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { connection } from "next/server";
import { SITUS, urlSitus } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Judul hanya memakai ketebalan 600, jadi cukup satu file statis (lebih ringan dari font variabel).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: "600",
});

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(urlSitus()),
    title: {
      default: `${SITUS.nama} · Toko demo hasil kebun dan dapur`,
      template: `%s · ${SITUS.nama}`,
    },
    description: SITUS.deskripsi,
    applicationName: SITUS.nama,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITUS.nama,
      images: [{ url: "/og/situs", width: 1200, height: 630, alt: "Lumbung Kabut, toko demo hasil kebun dan dapur" }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#34503b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Semua halaman dirender per request: nonce CSP harus baru di tiap respons.
  await connection();
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only z-50 rounded-full bg-arang px-4 py-2 text-sm font-semibold text-kertas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Lewati ke konten utama
        </a>
        <div className="bg-lumut-tua text-kertas">
          <p className="wadah flex flex-wrap items-center justify-center gap-x-2 py-2 text-center text-xs sm:text-sm">
            <span>{SITUS.bannerDemo}</span>
            <Link href="/tentang" className="font-semibold underline underline-offset-2 hover:text-kunyit-muda">
              Tentang demo ini
            </Link>
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}

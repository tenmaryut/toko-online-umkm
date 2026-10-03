import type { MetadataRoute } from "next";
import { urlSitus } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/akun", "/checkout", "/keranjang", "/masuk", "/daftar"],
      },
    ],
    sitemap: `${urlSitus()}/sitemap.xml`,
  };
}

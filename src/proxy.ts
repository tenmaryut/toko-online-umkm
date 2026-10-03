import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const AREA_LOGIN = ["/akun", "/checkout", "/admin"];

/**
 * 1. Content Security Policy dengan nonce acak per request (script hanya boleh dari situs ini
 *    dan yang membawa nonce). Header keamanan lain dipasang di Caddy.
 * 2. Redirect cepat ke /masuk untuk area yang butuh login. Ini hanya pemeriksaan optimis
 *    (ada/tidaknya cookie); pemeriksaan sebenarnya dilakukan di server pada tiap halaman/aksi.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const butuhLogin = AREA_LOGIN.some((awal) => pathname === awal || pathname.startsWith(`${awal}/`));
  if (butuhLogin && !getSessionCookie(request, { cookiePrefix: "lk" })) {
    const tujuan = new URL("/masuk", request.url);
    tujuan.searchParams.set("kembali", `${pathname}${search}`);
    return NextResponse.redirect(tujuan);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.SITE_URL?.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const headerRequest = new Headers(request.headers);
  headerRequest.set("x-nonce", nonce);
  headerRequest.set("Content-Security-Policy", csp);
  const respons = NextResponse.next({ request: { headers: headerRequest } });
  respons.headers.set("Content-Security-Policy", csp);
  return respons;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|images/|uploads/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

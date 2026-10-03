import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { urlSitus } from "./site";

export const AWALAN_COOKIE = "lk";

function buatAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET wajib diisi (minimal 32 karakter acak)");
  }
  return betterAuth({
    appName: "Lumbung Kabut",
    baseURL: urlSitus(),
    secret,
    trustedOrigins: [urlSitus()],
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        // Peran tidak bisa diisi pengguna saat mendaftar (input: false).
        role: { type: "string", required: false, defaultValue: "customer", input: false },
        isDemo: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      cookiePrefix: AWALAN_COOKIE,
    },
    // Endpoint HTTP Better Auth tidak dipasang; semua alur lewat Server Action (lihat src/actions/auth.ts)
    // yang memvalidasi input dengan Zod dan menerapkan rate limit sendiri.
    rateLimit: { enabled: false },
    telemetry: { enabled: false },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof buatAuth>;
const globalUntukAuth = globalThis as unknown as { __tokoAuth?: Auth };

/** Instance Better Auth dibuat saat pertama dipakai (bukan saat build). */
export function getAuth(): Auth {
  if (!globalUntukAuth.__tokoAuth) globalUntukAuth.__tokoAuth = buatAuth();
  return globalUntukAuth.__tokoAuth;
}

export type Sesi = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

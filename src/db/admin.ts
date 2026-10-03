import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import type { DB } from "./client";
import { account, user } from "./schema";

export type KredensialAdmin = { email: string; password: string; nama: string };

/**
 * Membaca file kredensial admin asli (format baris "Kunci: nilai"), mis.:
 *   Email: pemilik@contoh.test
 *   Password: ....
 *   Nama: Pemilik Toko
 */
export function bacaKredensialAdmin(isi: string): KredensialAdmin | null {
  const nilai = (kunci: string) =>
    isi
      .split(/\r?\n/)
      .map((baris) => baris.match(new RegExp(`^\\s*${kunci}\\s*:\\s*(.+?)\\s*$`, "i"))?.[1])
      .find(Boolean);
  const email = nilai("email")?.toLowerCase();
  const password = nilai("password");
  if (!email || !password || password.length < 12) return null;
  return { email, password, nama: nilai("nama") ?? "Pemilik Toko" };
}

/**
 * Memastikan akun admin asli ada dengan kata sandi sesuai file kredensial.
 * Idempoten: aman dijalankan di setiap start layanan.
 */
export async function pastikanAdminAsli(db: DB, kred: KredensialAdmin): Promise<"dibuat" | "diperbarui" | "tetap"> {
  const ada = db.select().from(user).where(eq(user.email, kred.email)).get();
  if (!ada) {
    const id = randomUUID();
    const hash = await hashPassword(kred.password);
    db.transaction((tx) => {
      tx.insert(user).values({ id, name: kred.nama, email: kred.email, emailVerified: true, role: "admin", isDemo: false }).run();
      tx.insert(account).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash }).run();
    });
    return "dibuat";
  }

  let berubah = false;
  if (ada.role !== "admin" || ada.isDemo) {
    db.update(user).set({ role: "admin", isDemo: false }).where(eq(user.id, ada.id)).run();
    berubah = true;
  }
  const kredensial = db
    .select()
    .from(account)
    .where(and(eq(account.userId, ada.id), eq(account.providerId, "credential")))
    .get();
  const cocok = kredensial?.password ? await verifyPassword({ hash: kredensial.password, password: kred.password }) : false;
  if (!cocok) {
    const hash = await hashPassword(kred.password);
    if (kredensial) {
      db.update(account).set({ password: hash }).where(eq(account.id, kredensial.id)).run();
    } else {
      db.insert(account).values({ id: randomUUID(), accountId: ada.id, providerId: "credential", userId: ada.id, password: hash }).run();
    }
    berubah = true;
  }
  return berubah ? "diperbarui" : "tetap";
}

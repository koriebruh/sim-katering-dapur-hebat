import "server-only";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { auditLog, pengguna, type Peran } from "@/db/schema";
import { bacaSesi } from "./session";

/** Pengguna yang sedang login, dibaca ulang dari database agar akun nonaktif langsung kehilangan akses. */
export const penggunaAktif = cache(async () => {
  const uid = await bacaSesi();
  if (!uid) return null;
  const [u] = await db
    .select({ id: pengguna.id, nama: pengguna.nama, username: pengguna.username, peran: pengguna.peran })
    .from(pengguna)
    .where(and(eq(pengguna.id, uid), eq(pengguna.aktif, true)))
    .limit(1);
  return u ?? null;
});

/**
 * Wajib dipanggil di setiap halaman dan server action internal.
 * Tanpa sesi: ke /login. Peran tidak diizinkan: ke /dashboard.
 */
export async function wajibLogin(peran?: readonly Peran[]) {
  const u = await penggunaAktif();
  if (!u) redirect("/login");
  if (peran && !peran.includes(u.peran)) redirect("/dashboard?akses=ditolak");
  return u;
}

type Penulis = Pick<typeof db, "insert">;

/** Jejak audit: siapa mengubah apa. `x` boleh berupa transaksi agar ikut batal bila aksinya gagal. */
export const catatAudit = (x: Penulis, penggunaId: number, aksi: string, entitas: string, entitasId: string | number, detail?: unknown) =>
  x.insert(auditLog).values({ penggunaId, aksi, entitas, entitasId: String(entitasId), detail: detail ?? null });

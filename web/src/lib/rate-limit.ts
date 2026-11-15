import "server-only";
import { and, eq, gt, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { percobaanLogin } from "@/db/schema";

const MAKS_PER_AKUN_IP = 5; // per kombinasi username + IP
const MAKS_PER_IP = 20; // semua username dari satu IP
const JENDELA_MENIT = 15;

/** IP klien dari proxy (Vercel mengisi x-forwarded-for); "tidak-diketahui" jika tidak ada. */
export async function ipKlien() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "tidak-diketahui";
  return ip.slice(0, 45);
}

/**
 * Mencatat percobaan LEBIH DULU, baru menghitung. Permintaan paralel masing-masing sudah
 * tercatat saat dihitung, sehingga tidak bisa melewati batas bersama-sama.
 * Blokir berlaku per username + IP, jadi pihak lain tidak dapat mengunci akun seseorang dari IP berbeda.
 */
export async function catatPercobaan(username: string, ip: string): Promise<{ diblokir: boolean }> {
  await db.insert(percobaanLogin).values({ username, ip });
  const [r] = await db
    .select({
      akunIp: sql<number>`count(*) filter (where ${percobaanLogin.username} = ${username} and ${percobaanLogin.ip} = ${ip})::int`,
      ip: sql<number>`count(*) filter (where ${percobaanLogin.ip} = ${ip})::int`,
    })
    .from(percobaanLogin)
    .where(and(
      or(eq(percobaanLogin.username, username), eq(percobaanLogin.ip, ip)),
      gt(percobaanLogin.dibuatPada, sql`now() - make_interval(mins => ${JENDELA_MENIT})`),
    ));
  return { diblokir: r.akunIp > MAKS_PER_AKUN_IP || r.ip > MAKS_PER_IP };
}

/** Login berhasil menghapus hitungan gagal untuk username + IP itu. */
export async function hapusPercobaan(username: string, ip: string) {
  await db.delete(percobaanLogin)
    .where(and(eq(percobaanLogin.username, username), eq(percobaanLogin.ip, ip)));
}

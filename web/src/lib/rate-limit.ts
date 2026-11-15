import "server-only";
import { and, eq, gt, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { percobaanLogin } from "@/db/schema";
import { kelompokIp } from "./format";

const MAKS_PER_AKUN_IP = 5; // per kombinasi username + IP
const MAKS_PER_IP = 20; // semua username dari satu IP
// Batas per akun dari semua IP: menahan tebakan tersebar dari banyak IP. Ambangnya lebih tinggi
// agar tidak mudah dipakai mengunci akun orang lain, dan blokirnya berakhir sendiri setelah jendela lewat.
const MAKS_PER_AKUN = 20;
const JENDELA_MENIT = 15;

/**
 * IP klien hanya dari header yang diisi platform Vercel. x-forwarded-for kiriman klien tidak dipakai
 * karena bisa dipalsukan untuk menghindari batas. Tanpa header itu (mis. lokal) semua permintaan
 * masuk satu kelompok, sehingga batas tetap berlaku.
 */
export async function ipKlien() {
  const h = await headers();
  const ip = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "tidak-diketahui";
  return kelompokIp(ip).slice(0, 45);
}

/**
 * Mencatat percobaan LEBIH DULU, baru menghitung. Permintaan paralel masing-masing sudah
 * tercatat saat dihitung, sehingga tidak bisa melewati batas bersama-sama.
 * Tiga batas: per username + IP (ketat), per IP, dan per username dari semua IP (longgar).
 */
export async function catatPercobaan(username: string, ip: string): Promise<{ diblokir: boolean }> {
  const [baru] = await db.insert(percobaanLogin).values({ username, ip }).returning({ id: percobaanLogin.id });
  const [r] = await db
    .select({
      akunIp: sql<number>`count(*) filter (where ${percobaanLogin.username} = ${username} and ${percobaanLogin.ip} = ${ip})::int`,
      ip: sql<number>`count(*) filter (where ${percobaanLogin.ip} = ${ip})::int`,
      akun: sql<number>`count(*) filter (where ${percobaanLogin.username} = ${username})::int`,
    })
    .from(percobaanLogin)
    .where(and(
      or(eq(percobaanLogin.username, username), eq(percobaanLogin.ip, ip)),
      gt(percobaanLogin.dibuatPada, sql`now() - make_interval(mins => ${JENDELA_MENIT})`),
    ));
  const diblokir = r.akunIp > MAKS_PER_AKUN_IP || r.ip > MAKS_PER_IP || r.akun > MAKS_PER_AKUN;
  // Percobaan yang ditolak tidak ikut dihitung, sehingga blokir selalu berakhir 15 menit setelah
  // kegagalan sungguhan terakhir dan tidak bisa diperpanjang dengan terus mencoba.
  if (diblokir) await db.delete(percobaanLogin).where(eq(percobaanLogin.id, baru.id));
  return { diblokir };
}

/** Login berhasil menghapus hitungan gagal untuk username + IP itu. */
export async function hapusPercobaan(username: string, ip: string) {
  await db.delete(percobaanLogin)
    .where(and(eq(percobaanLogin.username, username), eq(percobaanLogin.ip, ip)));
}

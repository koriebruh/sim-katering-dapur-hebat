import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { percobaanLogin } from "@/db/schema";

const MAKS_GAGAL = 5;
const JENDELA_MENIT = 15;

/** true jika username sudah gagal login MAKS_GAGAL kali dalam JENDELA_MENIT terakhir. */
export async function loginDiblokir(username: string) {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(percobaanLogin)
    .where(and(
      eq(percobaanLogin.username, username),
      eq(percobaanLogin.berhasil, false),
      gt(percobaanLogin.dibuatPada, sql`now() - make_interval(mins => ${JENDELA_MENIT})`),
    ));
  return r.n >= MAKS_GAGAL;
}

export async function catatLogin(username: string, berhasil: boolean) {
  await db.insert(percobaanLogin).values({ username, berhasil });
  // login berhasil menghapus hitungan gagal sebelumnya
  if (berhasil) {
    await db.delete(percobaanLogin)
      .where(and(eq(percobaanLogin.username, username), eq(percobaanLogin.berhasil, false)));
  }
}

import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const NAMA_COOKIE = "sesi";
const DURASI_DETIK = 8 * 60 * 60;

function kunci() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET minimal 32 karakter");
  return new TextEncoder().encode(s);
}

export async function buatSesi(uid: number) {
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURASI_DETIK}s`)
    .sign(kunci());
  (await cookies()).set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURASI_DETIK,
  });
}

/** Mengembalikan id pengguna dari cookie, atau null jika tidak ada / tidak sah / kedaluwarsa. */
export async function bacaSesi(): Promise<number | null> {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci(), { algorithms: ["HS256"] });
    return typeof payload.uid === "number" ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function hapusSesi() {
  (await cookies()).delete(NAMA_COOKIE);
}

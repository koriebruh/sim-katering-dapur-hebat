"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { pengguna } from "@/db/schema";
import { catatLogin, loginDiblokir } from "@/lib/rate-limit";
import { buatSesi, hapusSesi } from "@/lib/session";

const Skema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(30),
  password: z.string().min(1).max(100),
});

// Pesan sengaja seragam agar tidak membocorkan username mana yang terdaftar.
const GAGAL = "Nama pengguna atau kata sandi salah.";
// Hash pembanding saat username tidak ditemukan, supaya waktu respons tetap serupa.
const HASH_PALSU = "$2b$12$sbaPLJhbnbZg5OhVhHxP4uJlVydtaLUbx2T9PmYlgK0YvmAjyjodG";

export type StatusLogin = { pesan: string } | undefined;

export async function masuk(_: StatusLogin, form: FormData): Promise<StatusLogin> {
  const data = Skema.safeParse({ username: form.get("username"), password: form.get("password") });
  if (!data.success) return { pesan: GAGAL };
  const { username, password } = data.data;

  if (await loginDiblokir(username)) {
    return { pesan: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." };
  }

  const [u] = await db
    .select({ id: pengguna.id, hash: pengguna.passwordHash, aktif: pengguna.aktif })
    .from(pengguna).where(eq(pengguna.username, username)).limit(1);
  const cocok = await bcrypt.compare(password, u?.hash ?? HASH_PALSU);
  const sah = Boolean(u && u.aktif && cocok);
  await catatLogin(username, sah);
  if (!sah) return { pesan: GAGAL };

  await buatSesi(u.id);
  redirect("/dashboard");
}

export async function keluar() {
  await hapusSesi();
  redirect("/login");
}

"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { pelanggan } from "@/db/schema";
import { catatAudit, wajibLogin } from "@/lib/dal";
import { BERHASIL, GALAT } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";

const Skema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nama: z.string().trim().min(2).max(60),
  // disimpan sebagai digit saja; tanda hubung dan spasi dibuang
  noHp: z.string().transform((s) => s.replace(/[\s-]/g, "")).pipe(z.string().regex(/^0\d{8,13}$/)),
  alamat: z.string().trim().max(150),
});

export async function simpanPelanggan(f: FormData) {
  const u = await wajibLogin(aksesHalaman("/pelanggan"));
  const d = Skema.safeParse({ id: f.get("id") || undefined, nama: f.get("nama"), noHp: f.get("noHp"), alamat: f.get("alamat") ?? "" });
  const edit = f.get("id") ? `&edit=${Number(f.get("id")) || ""}` : "";
  if (!d.success) redirect(`/pelanggan?galat=${encodeURIComponent(GALAT.pelanggan)}${edit}`);
  const { id, ...isi } = d.data;

  if (id) {
    const r = await db.update(pelanggan).set(isi).where(eq(pelanggan.id, id)).returning({ id: pelanggan.id });
    if (!r.length) redirect(`/pelanggan?galat=${encodeURIComponent(GALAT.tidakAda)}`);
    // nomor HP tidak ikut dicatat di jejak audit
    await catatAudit(db, u.id, "ubah", "pelanggan", id, { nama: isi.nama });
  } else {
    const [r] = await db.insert(pelanggan).values(isi).returning({ id: pelanggan.id });
    await catatAudit(db, u.id, "tambah", "pelanggan", r.id, { nama: isi.nama });
  }
  redirect(`/pelanggan?ok=${encodeURIComponent(BERHASIL.disimpan)}`);
}

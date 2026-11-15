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

/** Menghapus pelanggan. Pelanggan yang sudah punya pesanan ditolak database (kunci asing). */
export async function hapusPelanggan(f: FormData) {
  const u = await wajibLogin(aksesHalaman("/pelanggan"));
  const id = Number(f.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect(`/pelanggan?galat=${encodeURIComponent(GALAT.tidakAda)}`);
  let galat: string | null = null;
  try {
    const r = await db.delete(pelanggan).where(eq(pelanggan.id, id)).returning({ nama: pelanggan.nama });
    if (!r.length) galat = GALAT.tidakAda;
    else await catatAudit(db, u.id, "hapus", "pelanggan", id, { nama: r[0].nama });
  } catch (e) {
    const kode = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    galat = kode === "23503" ? GALAT.pelangganDipakai : GALAT.tidakAda;
  }
  redirect(galat ? `/pelanggan?galat=${encodeURIComponent(galat)}&edit=${id}` : `/pelanggan?ok=${encodeURIComponent(BERHASIL.dihapus)}`);
}

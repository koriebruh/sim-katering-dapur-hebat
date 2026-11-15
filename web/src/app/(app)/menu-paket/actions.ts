"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { menu, menuFoto } from "@/db/schema";
import { catatAudit, wajibLogin } from "@/lib/dal";
import { BERHASIL, GALAT, jenisGambar, MAKS_FOTO } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";

const Skema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nama: z.string().trim().min(3).max(50),
  komposisi: z.string().trim().min(3).max(500),
  harga: z.coerce.number().int().min(1000).max(1_000_000),
  aktif: z.boolean(),
});

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const kembali = (q: string) => redirect(`/menu-paket?${q}`);

export async function simpanMenu(f: FormData) {
  const u = await wajibLogin(aksesHalaman("/menu-paket"));
  const d = Skema.safeParse({
    id: f.get("id") || undefined, nama: f.get("nama"), komposisi: f.get("komposisi"),
    harga: f.get("harga"), aktif: f.get("aktif") === "on",
  });
  const edit = f.get("id") ? `&edit=${Number(f.get("id")) || ""}` : "";
  if (!d.success) kembali(`galat=${encodeURIComponent(GALAT.menu)}${edit}`);
  const { id, ...isi } = d.data!;

  // foto baru: periksa ukuran dan jenis dari isi file sebelum menyentuh database
  const berkas = f.get("foto");
  let fotoBaru: { tipe: string; data: Buffer } | null = null;
  if (berkas instanceof File && berkas.size > 0) {
    if (berkas.size > MAKS_FOTO) kembali(`galat=${encodeURIComponent(GALAT.foto)}${edit}`);
    const data = Buffer.from(await berkas.arrayBuffer());
    const tipe = jenisGambar(data);
    if (!tipe) kembali(`galat=${encodeURIComponent(GALAT.foto)}${edit}`);
    fotoBaru = { tipe: tipe!, data };
  }
  const hapusFoto = f.get("hapusFoto") === "on";
  const simpanFoto = async (menuId: number) => {
    if (fotoBaru) {
      await db.insert(menuFoto).values({ menuId, ...fotoBaru })
        .onConflictDoUpdate({ target: menuFoto.menuId, set: { ...fotoBaru, diperbaruiPada: new Date() } });
      // alamat diberi versi agar peramban tidak memakai foto lama dari cache
      await db.update(menu).set({ foto: `/foto-menu/${menuId}?v=${Date.now()}` }).where(eq(menu.id, menuId));
    } else if (hapusFoto) {
      await db.delete(menuFoto).where(eq(menuFoto.menuId, menuId));
      await db.update(menu).set({ foto: null }).where(eq(menu.id, menuId));
    }
  };

  try {
    if (id) {
      const r = await db.update(menu).set(isi).where(eq(menu.id, id)).returning({ id: menu.id });
      if (!r.length) throw new Error("tidak-ada");
      await simpanFoto(id);
      await catatAudit(db, u.id, "ubah", "menu", id, { ...isi, foto: fotoBaru ? "diganti" : hapusFoto ? "dihapus" : "tetap" });
    } else {
      const [r] = await db.insert(menu).values({ ...isi, slug: slug(isi.nama) }).returning({ id: menu.id });
      await simpanFoto(r.id);
      await catatAudit(db, u.id, "tambah", "menu", r.id, { ...isi, foto: fotoBaru ? "ada" : "tanpa" });
    }
  } catch (e) {
    // 23505 = pelanggaran unik (slug dari nama yang sama)
    const kode = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    kembali(`galat=${encodeURIComponent(kode === "23505" ? GALAT.menuGanda : GALAT.tidakAda)}${edit}`);
  }
  revalidatePath("/");
  kembali(`ok=${encodeURIComponent(BERHASIL.disimpan)}`);
}

/** Menghapus menu. Menu yang sudah pernah dipesan ditolak database (kunci asing) dan cukup dinonaktifkan. */
export async function hapusMenu(f: FormData) {
  const u = await wajibLogin(aksesHalaman("/menu-paket"));
  const id = Number(f.get("id"));
  if (!Number.isInteger(id) || id <= 0) kembali(`galat=${encodeURIComponent(GALAT.tidakAda)}`);
  try {
    const r = await db.delete(menu).where(eq(menu.id, id)).returning({ nama: menu.nama });
    if (!r.length) throw new Error("tidak-ada");
    await catatAudit(db, u.id, "hapus", "menu", id, { nama: r[0].nama });
  } catch (e) {
    const kode = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    kembali(`galat=${encodeURIComponent(kode === "23503" ? GALAT.menuDipakai : GALAT.tidakAda)}&edit=${id}`);
  }
  revalidatePath("/");
  kembali(`ok=${encodeURIComponent(BERHASIL.dihapus)}`);
}

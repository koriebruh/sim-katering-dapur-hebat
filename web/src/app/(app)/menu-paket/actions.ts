"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { menu } from "@/db/schema";
import { catatAudit, wajibLogin } from "@/lib/dal";
import { BERHASIL, GALAT } from "@/lib/pesanan";
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

  try {
    if (id) {
      const r = await db.update(menu).set(isi).where(eq(menu.id, id)).returning({ id: menu.id });
      if (!r.length) throw new Error("tidak-ada");
      await catatAudit(db, u.id, "ubah", "menu", id, isi);
    } else {
      const [r] = await db.insert(menu).values({ ...isi, slug: slug(isi.nama) }).returning({ id: menu.id });
      await catatAudit(db, u.id, "tambah", "menu", r.id, isi);
    }
  } catch (e) {
    // 23505 = pelanggaran unik (slug dari nama yang sama)
    const kode = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    kembali(`galat=${encodeURIComponent(kode === "23505" ? GALAT.menuGanda : GALAT.tidakAda)}${edit}`);
  }
  revalidatePath("/");
  kembali(`ok=${encodeURIComponent(BERHASIL.disimpan)}`);
}

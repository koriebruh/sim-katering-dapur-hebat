import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuFoto } from "@/db/schema";

/** Menyajikan foto menu yang diunggah admin. Publik, karena foto menu tampil di halaman depan. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Tidak ditemukan", { status: 404 });
  const [f] = await db.select({ tipe: menuFoto.tipe, data: menuFoto.data }).from(menuFoto).where(eq(menuFoto.menuId, id)).limit(1);
  if (!f) return new Response("Tidak ditemukan", { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      // tipe berasal dari pemeriksaan isi file saat unggah, bukan dari klaim pengunggah
      "Content-Type": f.tipe,
      "Content-Length": String(f.data.length),
      // alamat foto memuat versi (?v=), jadi aman disimpan lama di cache
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}

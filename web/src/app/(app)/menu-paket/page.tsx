import { asc } from "drizzle-orm";
import { ImageOff, Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Muncul } from "@/components/klien";
import { Judul, kelas, Pesan } from "@/components/ui";
import { db } from "@/db";
import { menu } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { rupiah } from "@/lib/format";
import { aksesHalaman } from "@/lib/roles";
import { hapusMenu, simpanMenu } from "./actions";

export const metadata: Metadata = { title: "Menu & Paket" };

export default async function HalamanMenu({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string; edit?: string }> }) {
  await wajibLogin(aksesHalaman("/menu-paket"));
  const { ok, galat, edit } = await searchParams;
  const daftar = await db.select().from(menu).orderBy(asc(menu.id));
  const dipilih = daftar.find((m) => String(m.id) === edit);

  return (
    <>
      <Judul judul="Menu & Paket" sub={`${daftar.filter((m) => m.aktif).length} menu dijual dari ${daftar.length} menu`} />
      <Pesan ok={ok} galat={galat} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {daftar.map((m, i) => (
            <li key={m.id}>
              <Muncul urut={i} className={`${kelas.kartu} group flex h-full flex-col overflow-hidden !p-0 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-500/10`}>
                <div className="relative aspect-[16/10] bg-accent-100">
                  {m.foto
                    ? <Image src={m.foto} alt="" fill sizes="(min-width: 640px) 320px, 92vw" unoptimized={m.foto.startsWith("/foto-menu/")} className="object-cover transition duration-500 group-hover:scale-105" />
                    : <span className="absolute inset-0 grid place-items-center text-accent-500/60"><ImageOff size={30} aria-label="Belum ada foto" /></span>}
                  {!m.aktif && <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">Tidak dijual</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-bold text-ink">{m.nama}</h2>
                    <p className="shrink-0 font-bold text-accent-600">{rupiah(m.harga)}</p>
                  </div>
                  <p className="mt-1 flex-1 text-sm text-muted">{m.komposisi}</p>
                  <Link href={`/menu-paket?edit=${m.id}`} scroll={false} className={`${kelas.tombolKecil} mt-3 self-start`}>
                    <Pencil size={13} aria-hidden /> Ubah
                  </Link>
                </div>
              </Muncul>
            </li>
          ))}
        </ul>

        <form action={simpanMenu} key={dipilih?.id ?? "baru"} className={`${kelas.kartu} h-fit xl:sticky xl:top-6`}>
          <h2 className="mb-4 font-bold text-ink">{dipilih ? `Ubah ${dipilih.nama}` : "Tambah menu"}</h2>
          {dipilih && <input type="hidden" name="id" value={dipilih.id} />}
          <label className={kelas.label} htmlFor="nama">Nama menu</label>
          <input id="nama" name="nama" required minLength={3} maxLength={50} defaultValue={dipilih?.nama} className={kelas.input} />
          <label className={`${kelas.label} mt-4`} htmlFor="komposisi">Komposisi (pisahkan dengan koma)</label>
          <textarea id="komposisi" name="komposisi" required minLength={3} maxLength={500} rows={3} defaultValue={dipilih?.komposisi} className={kelas.input} />
          <label className={`${kelas.label} mt-4`} htmlFor="harga">Harga per porsi (Rp)</label>
          <input id="harga" name="harga" type="number" required min={1000} max={1000000} step={500} defaultValue={dipilih?.harga} className={kelas.input} />
          <label className={`${kelas.label} mt-4`} htmlFor="foto">Foto menu (JPG, PNG, atau WebP, maks. 2 MB)</label>
          {dipilih?.foto && (
            <div className="relative mb-2 aspect-[16/10] overflow-hidden rounded-xl bg-accent-100">
              <Image src={dipilih.foto} alt={`Foto ${dipilih.nama} saat ini`} fill sizes="320px" unoptimized={dipilih.foto.startsWith("/foto-menu/")} className="object-cover" />
            </div>
          )}
          <input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp"
            className={`${kelas.input} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-600`} />
          <p className="mt-1.5 text-xs text-muted">{dipilih?.foto ? "Pilih file untuk mengganti foto, atau biarkan kosong agar foto tetap." : "Opsional. Tanpa foto, kartu menu menampilkan ikon."}</p>
          {dipilih?.foto && (
            <label className="mt-2 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="hapusFoto" className="size-4" /> Hapus foto
            </label>
          )}
          <label className="mt-4 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="aktif" defaultChecked={dipilih?.aktif ?? true} className="size-4 accent-accent-500" /> Dijual
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className={kelas.tombol}>{dipilih ? <Save size={16} aria-hidden /> : <Plus size={16} aria-hidden />} {dipilih ? "Simpan perubahan" : "Tambah menu"}</button>
            {dipilih && <Link href="/menu-paket" scroll={false} className={kelas.tombolGaris}>Batal</Link>}
          </div>
          {dipilih && (
            <button formAction={hapusMenu} formNoValidate className={`${kelas.tombolGaris} mt-3 w-full hover:!border-red-300 hover:!text-red-700`}>
              <Trash2 size={16} aria-hidden /> Hapus menu ini
            </button>
          )}
        </form>
      </div>
    </>
  );
}

import { asc, sql } from "drizzle-orm";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Judul, kelas, Kosong, Pesan, Tabel } from "@/components/ui";
import { db } from "@/db";
import { pelanggan, pesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { hpUntuk } from "@/lib/format";
import { aksesHalaman } from "@/lib/roles";
import { hapusPelanggan, simpanPelanggan } from "./actions";

export const metadata: Metadata = { title: "Pelanggan" };

export default async function HalamanPelanggan({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string; edit?: string }> }) {
  const u = await wajibLogin(aksesHalaman("/pelanggan"));
  const { ok, galat, edit } = await searchParams;
  const daftar = await db
    .select({
      id: pelanggan.id, nama: pelanggan.nama, noHp: pelanggan.noHp, alamat: pelanggan.alamat,
      jumlahPesanan: sql<number>`(select count(*) from ${pesanan} where ${pesanan.pelangganId} = ${pelanggan.id})::int`,
    })
    .from(pelanggan).orderBy(asc(pelanggan.nama));
  const dipilih = daftar.find((p) => String(p.id) === edit);

  return (
    <>
      <Judul judul="Pelanggan" sub={`${daftar.length} pelanggan tercatat`} />
      <Pesan ok={ok} galat={galat} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className={`${kelas.kartu} min-w-0 !p-0`}>
          {daftar.length === 0 ? (
            <Kosong judul="Belum ada pelanggan" isi="Tambahkan pelanggan pertama lewat formulir di samping." />
          ) : (
            <Tabel kepala={["Nama", "Nomor HP", "Alamat", "Pesanan", ""]} kanan={[3]}>
              {daftar.map((p) => (
                <tr key={p.id} className="transition hover:bg-accent-100/40">
                  <td className={`${kelas.td} font-semibold text-ink`}>{p.nama}</td>
                  <td className={`${kelas.td} whitespace-nowrap tabular-nums`}>{hpUntuk(u.peran, p.noHp)}</td>
                  <td className={`${kelas.td} text-muted`}>{p.alamat || "—"}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{p.jumlahPesanan}</td>
                  <td className={`${kelas.td} text-right`}>
                    <Link href={`/pelanggan?edit=${p.id}`} scroll={false} className={kelas.tombolKecil} aria-label={`Ubah ${p.nama}`}>
                      <Pencil size={13} aria-hidden /> Ubah
                    </Link>
                  </td>
                </tr>
              ))}
            </Tabel>
          )}
        </div>

        <form action={simpanPelanggan} key={dipilih?.id ?? "baru"} className={`${kelas.kartu} h-fit xl:sticky xl:top-6`}>
          <h2 className="mb-4 font-bold text-ink">{dipilih ? `Ubah ${dipilih.nama}` : "Tambah pelanggan"}</h2>
          {dipilih && <input type="hidden" name="id" value={dipilih.id} />}
          <label className={kelas.label} htmlFor="nama">Nama pelanggan atau instansi</label>
          <input id="nama" name="nama" required minLength={2} maxLength={60} defaultValue={dipilih?.nama} className={kelas.input} />
          <label className={`${kelas.label} mt-4`} htmlFor="noHp">Nomor HP / WhatsApp</label>
          <input id="noHp" name="noHp" required inputMode="tel" pattern="0[0-9\s\-]{8,16}" placeholder="0812xxxxxxxx" defaultValue={dipilih?.noHp} className={kelas.input} />
          <label className={`${kelas.label} mt-4`} htmlFor="alamat">Alamat</label>
          <textarea id="alamat" name="alamat" maxLength={150} rows={2} defaultValue={dipilih?.alamat} className={kelas.input} />
          <div className="mt-5 flex gap-2">
            <button className={kelas.tombol}>{dipilih ? <Save size={16} aria-hidden /> : <Plus size={16} aria-hidden />} {dipilih ? "Simpan perubahan" : "Tambah pelanggan"}</button>
            {dipilih && <Link href="/pelanggan" scroll={false} className={kelas.tombolGaris}>Batal</Link>}
          </div>
          {dipilih && (
            <button formAction={hapusPelanggan} formNoValidate className={`${kelas.tombolGaris} mt-3 w-full hover:!border-red-300 hover:!text-red-700`}>
              <Trash2 size={16} aria-hidden /> Hapus pelanggan ini
            </button>
          )}
        </form>
      </div>
    </>
  );
}

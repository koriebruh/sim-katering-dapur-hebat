import { and, desc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Judul, kelas, Kosong, Lencana, Pesan, Tabel } from "@/components/ui";
import { db } from "@/db";
import { pelanggan, pesanan, statusPesananEnum, type StatusPesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { hpUntuk, jam, rupiah, tanggal } from "@/lib/format";
import { LABEL_STATUS, rentangHari, tanggalSah } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";

export const metadata: Metadata = { title: "Pesanan" };

const BATAS = 100; // tanpa paginasi: volume demo jauh di bawah ini; tampilkan catatan bila terpotong

export default async function DaftarPesanan({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; dari?: string; sampai?: string; ok?: string; galat?: string }>;
}) {
  const u = await wajibLogin(aksesHalaman("/pesanan"));
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const status = statusPesananEnum.enumValues.includes(sp.status as StatusPesanan) ? (sp.status as StatusPesanan) : undefined;
  const dari = tanggalSah(sp.dari) ? sp.dari : undefined;
  const sampai = tanggalSah(sp.sampai) ? sp.sampai : undefined;
  const pola = `%${q.replace(/[\\%_]/g, "\\$&")}%`;

  const daftar = await db
    .select({
      kode: pesanan.kode, nama: pelanggan.nama, noHp: pelanggan.noHp, tglKirim: pesanan.tglKirim, total: pesanan.total, status: pesanan.status,
      porsi: sql<number>`coalesce((select sum(d.jumlah) from detail_pesanan d where d.pesanan_id = ${pesanan.id}), 0)::int`,
      dibayar: sql<number>`coalesce((select sum(b.jumlah) from pembayaran b where b.pesanan_id = ${pesanan.id}), 0)::int`,
    })
    .from(pesanan).innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
    .where(and(
      q ? or(ilike(pelanggan.nama, pola), ilike(pesanan.kode, pola)) : undefined,
      status ? eq(pesanan.status, status) : undefined,
      dari ? gte(pesanan.tglKirim, rentangHari(dari)[0]) : undefined,
      sampai ? lt(pesanan.tglKirim, rentangHari(sampai)[1]) : undefined,
    ))
    .orderBy(desc(pesanan.tglKirim)).limit(BATAS + 1);
  const terpotong = daftar.length > BATAS;
  const tampil = daftar.slice(0, BATAS);
  const adaFilter = Boolean(q || status || dari || sampai);

  return (
    <>
      <Judul judul="Pesanan" sub="Cari menurut pelanggan, nomor pesanan, tanggal kirim, atau status">
        {u.peran === "admin" && <Link href="/pesanan/baru" className={kelas.tombol}><Plus size={16} aria-hidden /> Pesanan baru</Link>}
      </Judul>
      <Pesan ok={sp.ok} galat={sp.galat} />

      <form className={`${kelas.kartu} mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end`}>
        <div>
          <label className={kelas.label} htmlFor="q">Pelanggan atau nomor pesanan</label>
          <input id="q" name="q" defaultValue={q} maxLength={60} placeholder="mis. Maju atau PSN-2611" className={kelas.input} />
        </div>
        <div>
          <label className={kelas.label} htmlFor="dari">Kirim dari</label>
          <input id="dari" name="dari" type="date" defaultValue={dari} className={kelas.input} />
        </div>
        <div>
          <label className={kelas.label} htmlFor="sampai">Kirim sampai</label>
          <input id="sampai" name="sampai" type="date" defaultValue={sampai} className={kelas.input} />
        </div>
        <div>
          <label className={kelas.label} htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className={kelas.input}>
            <option value="">Semua status</option>
            {statusPesananEnum.enumValues.map((s) => <option key={s} value={s}>{LABEL_STATUS[s]}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className={kelas.tombol}><Search size={16} aria-hidden /> Cari</button>
          {adaFilter && <Link href="/pesanan" className={kelas.tombolGaris}>Hapus filter</Link>}
        </div>
      </form>

      <div className={`${kelas.kartu} !p-0`}>
        {tampil.length === 0 ? (
          <Kosong
            judul={adaFilter ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
            isi={adaFilter ? "Ubah kata kunci, rentang tanggal, atau status." : "Pesanan yang dicatat admin akan muncul di sini."}
          />
        ) : (
          <Tabel kepala={["No. pesanan", "Pelanggan", "Kirim", "Porsi", "Total", "Sisa tagihan", "Status"]} kanan={[3, 4, 5]}>
            {tampil.map((p) => (
              <tr key={p.kode} className="transition hover:bg-accent-100/40">
                <td className={kelas.td}>
                  <Link href={`/pesanan/${p.kode}`} className="font-semibold text-accent-600 underline-offset-2 hover:underline">{p.kode}</Link>
                </td>
                <td className={kelas.td}>
                  <div className="font-medium text-ink">{p.nama}</div>
                  <div className="text-xs tabular-nums text-muted">{hpUntuk(u.peran, p.noHp)}</div>
                </td>
                <td className={`${kelas.td} whitespace-nowrap tabular-nums`}>{tanggal(p.tglKirim)} <span className="text-muted">{jam(p.tglKirim)}</span></td>
                <td className={`${kelas.td} text-right tabular-nums`}>{p.porsi}</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(p.total)}</td>
                <td className={`${kelas.td} text-right font-semibold tabular-nums ${p.status !== "batal" && p.total > p.dibayar ? "text-red-700" : "text-muted"}`}>
                  {p.status === "batal" ? "—" : rupiah(p.total - p.dibayar)}
                </td>
                <td className={kelas.td}><Lencana status={p.status} /></td>
              </tr>
            ))}
          </Tabel>
        )}
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          {terpotong ? `Menampilkan ${BATAS} pesanan terbaru. Persempit dengan filter untuk melihat yang lain.` : `${tampil.length} pesanan`}
        </p>
      </div>
    </>
  );
}

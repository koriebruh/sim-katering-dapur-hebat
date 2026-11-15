import { and, asc, eq, gte, inArray, lt } from "drizzle-orm";
import { CheckCircle2, ChevronLeft, ChevronRight, MapPin, Send, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Muncul } from "@/components/klien";
import { Judul, kelas, Kosong, Lencana, Pesan } from "@/components/ui";
import { db } from "@/db";
import { detailPesanan, menu, pelanggan, pesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { jam, tanggalPanjang } from "@/lib/format";
import { geserHari, rekapKomponen, rentangHari, tanggalSah, tanggalWib, transisiUntuk } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";
import { ubahStatus } from "../pesanan/actions";

export const metadata: Metadata = { title: "Jadwal Produksi" };

export default async function Jadwal({ searchParams }: { searchParams: Promise<{ tgl?: string; ok?: string; galat?: string }> }) {
  const u = await wajibLogin(aksesHalaman("/jadwal"));
  const sp = await searchParams;
  const hariIni = tanggalWib();
  const tgl = tanggalSah(sp.tgl) ? sp.tgl : hariIni;
  const [awal, akhir] = rentangHari(tgl);

  // Pesanan masuk jadwal setelah uang muka dibayar; yang menunggu DP dan batal tidak tampil.
  const daftar = await db
    .select({ id: pesanan.id, kode: pesanan.kode, tglKirim: pesanan.tglKirim, alamatKirim: pesanan.alamatKirim, catatan: pesanan.catatan, status: pesanan.status, nama: pelanggan.nama })
    .from(pesanan).innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
    .where(and(gte(pesanan.tglKirim, awal), lt(pesanan.tglKirim, akhir), inArray(pesanan.status, ["diproses", "dikirim", "selesai"])))
    .orderBy(asc(pesanan.tglKirim));
  const item = daftar.length
    ? await db.select({ pesananId: detailPesanan.pesananId, nama: menu.nama, komposisi: menu.komposisi, jumlah: detailPesanan.jumlah })
      .from(detailPesanan).innerJoin(menu, eq(detailPesanan.menuId, menu.id))
      .where(inArray(detailPesanan.pesananId, daftar.map((p) => p.id)))
    : [];
  const rekap = rekapKomponen(item);
  const totalPorsi = item.reduce((a, d) => a + d.jumlah, 0);
  const maks = rekap[0]?.[1] ?? 1;

  return (
    <>
      <Judul judul="Jadwal produksi" sub={tanggalPanjang(awal)}>
        <Link href={`/jadwal?tgl=${geserHari(tgl, -1)}`} className={kelas.tombolGaris} aria-label="Hari sebelumnya"><ChevronLeft size={16} aria-hidden /></Link>
        <form className="flex gap-2">
          <label htmlFor="tgl" className="sr-only">Tanggal</label>
          <input id="tgl" name="tgl" type="date" defaultValue={tgl} className={`${kelas.input} !w-auto`} />
          <button className={kelas.tombolGaris}>Lihat</button>
        </form>
        <Link href={`/jadwal?tgl=${geserHari(tgl, 1)}`} className={kelas.tombolGaris} aria-label="Hari berikutnya"><ChevronRight size={16} aria-hidden /></Link>
        {tgl !== hariIni && <Link href="/jadwal" className={kelas.tombol}>Hari ini</Link>}
      </Judul>
      <Pesan ok={sp.ok} galat={sp.galat} />

      {daftar.length === 0 ? (
        <div className={kelas.kartu}>
          <Kosong judul="Tidak ada produksi di tanggal ini" isi="Pesanan muncul di sini setelah uang mukanya dicatat admin." />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <ol className="grid gap-4">
            {daftar.map((p, i) => {
              const ke = transisiUntuk(p.status, u.peran).find((s) => s !== "batal");
              return (
                <li key={p.kode}>
                  <Muncul urut={i} className={`${kelas.kartu} grid gap-3 sm:grid-cols-[84px_1fr_auto] sm:items-start`}>
                    <div className="text-2xl font-extrabold tabular-nums text-accent-600">{jam(p.tglKirim)}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-ink">{p.nama}</h2>
                        <span className="text-xs text-muted">{p.kode}</span>
                      </div>
                      <ul className="mt-2 grid gap-1 text-sm">
                        {item.filter((d) => d.pesananId === p.id).map((d) => (
                          <li key={d.nama} className="flex justify-between gap-3">
                            <span>{d.nama}</span><b className="tabular-nums">{d.jumlah} porsi</b>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 flex gap-2 text-sm text-muted"><MapPin size={15} aria-hidden className="mt-0.5 shrink-0" /> {p.alamatKirim}</p>
                      {p.catatan && <p className="mt-1 flex gap-2 text-sm font-medium text-amber-800"><StickyNote size={15} aria-hidden className="mt-0.5 shrink-0" /> {p.catatan}</p>}
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Lencana status={p.status} />
                      {ke && (
                        <form action={ubahStatus}>
                          <input type="hidden" name="kode" value={p.kode} />
                          <input type="hidden" name="ke" value={ke} />
                          <input type="hidden" name="kembali" value={`/jadwal?tgl=${tgl}`} />
                          <button className={kelas.tombolKecil}>
                            {ke === "dikirim" ? <Send size={13} aria-hidden /> : <CheckCircle2 size={13} aria-hidden />}
                            {ke === "dikirim" ? "Kirim" : "Selesai"}
                          </button>
                        </form>
                      )}
                    </div>
                  </Muncul>
                </li>
              );
            })}
          </ol>

          <section className={`${kelas.kartu} h-fit`} aria-labelledby="h-rekap">
            <h2 id="h-rekap" className="font-bold text-ink">Rekap kebutuhan komponen</h2>
            <p className="mb-4 text-sm text-muted">{daftar.length} pesanan, {totalPorsi} porsi</p>
            <ul className="grid gap-2.5 text-sm">
              {rekap.map(([nama, n]) => (
                <li key={nama}>
                  <div className="flex justify-between gap-3"><span className="capitalize">{nama}</span><b className="tabular-nums">{n}</b></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent-100">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${(n / maks) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}

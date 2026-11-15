import { and, asc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { AlertTriangle, ArrowRight, CalendarClock, Plus, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Angka, Batang, Muncul } from "@/components/klien";
import { Judul, kelas, Kosong, Lencana, Pesan } from "@/components/ui";
import { db } from "@/db";
import { pelanggan, pesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { jam, rupiah, tanggal, tanggalPanjang } from "@/lib/format";
import { omzetBulanan, penjualanPerMenu, periode, piutang, ringkasan } from "@/lib/laporan";
import { rentangHari, tanggalWib } from "@/lib/pesanan";
import { LABEL_PERAN } from "@/lib/roles";

export const metadata: Metadata = { title: "Dashboard" };

function Kpi({ label, nilai, awalan = "", ket, urut }: { label: string; nilai: number; awalan?: string; ket?: React.ReactNode; urut: number }) {
  return (
    <Muncul urut={urut} className={kelas.kartu}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-ink"><Angka nilai={nilai} awalan={awalan} /></div>
      {ket && <div className="mt-1 text-xs text-muted">{ket}</div>}
    </Muncul>
  );
}

/** F-10 (pemilik) dan ringkasan manajer: omzet, tren, menu terlaris, piutang. */
async function RingkasanUsaha() {
  const p = periode({});
  const [y, m] = p.dari.split("-").map(Number);
  const laluAwal = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 10);
  const [kini, lalu, tren, terlaris, utang] = await Promise.all([
    ringkasan(p.awal, p.akhir), ringkasan(rentangHari(laluAwal)[0], p.awal), omzetBulanan(6), penjualanPerMenu(p.awal, p.akhir), piutang(),
  ]);
  const totalPiutang = utang.reduce((a, x) => a + x.total - x.dibayar, 0);
  const selisih = lalu.omzet > 0 ? Math.round(((kini.omzet - lalu.omzet) / lalu.omzet) * 100) : null;
  // lewat = tanggal kirimnya sebelum hari ini (WIB) tetapi belum lunas
  const awalHariIni = rentangHari(tanggalWib())[0].getTime();
  const lewat = utang.filter((x) => x.tglKirim.getTime() < awalHariIni);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi urut={0} label="Omzet bulan ini" nilai={kini.omzet} awalan="Rp" ket={selisih === null ? "Bulan lalu belum ada penjualan" : (
          <span className={`inline-flex items-center gap-1 font-semibold ${selisih >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {selisih >= 0 ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />} {Math.abs(selisih)}% {selisih >= 0 ? "di atas" : "di bawah"} bulan lalu
          </span>
        )} />
        <Kpi urut={1} label="Pesanan bulan ini" nilai={kini.pesanan} ket={`Bulan lalu ${lalu.pesanan}`} />
        <Kpi urut={2} label="Porsi bulan ini" nilai={kini.porsi} ket={`Bulan lalu ${lalu.porsi.toLocaleString("id-ID")}`} />
        <Kpi urut={3} label="Piutang belum lunas" nilai={totalPiutang} awalan="Rp" ket={`${utang.length} pesanan`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-5">
          <section className={kelas.kartu} aria-labelledby="h-tren">
            <h2 id="h-tren" className="mb-4 font-bold text-ink">Omzet 6 bulan terakhir</h2>
            <Batang data={tren} satuan="Juta rupiah, menurut tanggal kirim. Bulan berjalan termasuk pesanan yang sudah terjadwal." />
          </section>
          <section className={kelas.kartu} aria-labelledby="h-perhatian">
            <h2 id="h-perhatian" className="mb-3 flex items-center gap-2 font-bold text-ink"><AlertTriangle size={17} aria-hidden className="text-amber-600" /> Perlu perhatian</h2>
            {lewat.length === 0 ? (
              <p className="text-sm text-muted">Tidak ada tagihan yang lewat tanggal kirim.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {lewat.slice(0, 4).map((x) => (
                  <li key={x.kode} className="flex flex-wrap justify-between gap-x-4">
                    <span><b className="text-ink">{x.nama}</b> belum melunasi pesanan {x.kode}, dikirim {tanggal(x.tglKirim)}</span>
                    <b className="tabular-nums text-red-700">{rupiah(x.total - x.dibayar)}</b>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/laporan" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline">Buka laporan <ArrowRight size={14} aria-hidden /></Link>
          </section>
        </div>

        <section className={`${kelas.kartu} h-fit`} aria-labelledby="h-laris">
          <h2 id="h-laris" className="mb-3 font-bold text-ink">Menu terlaris bulan ini</h2>
          {terlaris.length === 0 ? <p className="text-sm text-muted">Belum ada penjualan bulan ini.</p> : (
            <ol className="grid gap-3">
              {[...terlaris].sort((a, b) => b.porsi - a.porsi).slice(0, 6).map((t, i) => (
                <li key={t.nama}>
                  <Muncul urut={i} className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-accent-100">
                      {t.foto && <Image src={t.foto} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{t.nama}</span>
                      <span className="text-xs text-muted">{rupiah(t.penjualan)}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums text-ink">{t.porsi.toLocaleString("id-ID")} <span className="font-normal text-muted">porsi</span></span>
                  </Muncul>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

/** Dashboard admin dan kepala dapur: pekerjaan hari ini dan pesanan terdekat. */
async function RingkasanOperasional({ dapur }: { dapur: boolean }) {
  const [awal, akhir] = rentangHari(tanggalWib());
  const [[hitung], terdekat] = await Promise.all([
    db.select({
      menungguDp: sql<number>`count(*) filter (where ${pesanan.status} = 'menunggu_dp')::int`,
      diproses: sql<number>`count(*) filter (where ${pesanan.status} = 'diproses')::int`,
      dikirim: sql<number>`count(*) filter (where ${pesanan.status} = 'dikirim')::int`,
      hariIni: sql<number>`count(*) filter (where ${pesanan.status} in ('diproses','dikirim','selesai') and ${pesanan.tglKirim} >= ${awal.toISOString()} and ${pesanan.tglKirim} < ${akhir.toISOString()})::int`,
    }).from(pesanan),
    db.select({
      kode: pesanan.kode, nama: pelanggan.nama, tglKirim: pesanan.tglKirim, status: pesanan.status,
      porsi: sql<number>`coalesce((select sum(d.jumlah) from detail_pesanan d where d.pesanan_id = ${pesanan.id}), 0)::int`,
    })
      .from(pesanan).innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
      .where(and(
        gte(pesanan.tglKirim, awal), dapur ? lt(pesanan.tglKirim, new Date(akhir.getTime() + 86_400_000)) : undefined,
        inArray(pesanan.status, dapur ? ["diproses", "dikirim"] : ["menunggu_dp", "diproses", "dikirim"]),
      ))
      .orderBy(asc(pesanan.tglKirim)).limit(6),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi urut={0} label="Produksi hari ini" nilai={hitung.hariIni} ket="pesanan dikirim hari ini" />
        <Kpi urut={1} label="Sedang diproses" nilai={hitung.diproses} />
        <Kpi urut={2} label="Sedang dikirim" nilai={hitung.dikirim} />
        <Kpi urut={3} label="Menunggu uang muka" nilai={hitung.menungguDp} ket="belum masuk jadwal dapur" />
      </div>
      <section className={`${kelas.kartu} mt-5 !p-0`} aria-labelledby="h-dekat">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <h2 id="h-dekat" className="font-bold text-ink">{dapur ? "Dimasak hari ini dan besok" : "Pesanan terdekat"}</h2>
          <Link href={dapur ? "/jadwal" : "/pesanan"} className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline">
            {dapur ? "Buka jadwal produksi" : "Semua pesanan"} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        {terdekat.length === 0 ? (
          <Kosong judul="Tidak ada pesanan terjadwal" isi={dapur ? "Belum ada pesanan untuk hari ini dan besok." : "Catat pesanan baru untuk mulai mengisi jadwal."} />
        ) : (
          <ul className="mt-3 divide-y divide-line/70">
            {terdekat.map((p, i) => (
              <li key={p.kode}>
                <Muncul urut={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                  <span className="flex w-36 items-center gap-2 tabular-nums text-ink"><CalendarClock size={15} aria-hidden className="text-accent-500" /> {tanggal(p.tglKirim).slice(0, 5)} {jam(p.tglKirim)}</span>
                  <span className="min-w-0 flex-1 font-semibold text-ink">{p.nama} <span className="font-normal text-muted">{p.kode}</span></span>
                  <span className="tabular-nums text-muted">{p.porsi} porsi</span>
                  <Lencana status={p.status} />
                </Muncul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ akses?: string; ok?: string; galat?: string }> }) {
  const u = await wajibLogin();
  const { akses, ok, galat } = await searchParams;
  return (
    <>
      <Judul judul={`Halo, ${u.nama.replace(/^((Ibu|Bapak|Hj\.|H\.)\s+)+/i, "").split(" ")[0]}`} sub={`${LABEL_PERAN[u.peran]}, ${tanggalPanjang(new Date())}`}>
        {u.peran === "admin" && <Link href="/pesanan/baru" className={kelas.tombol}><Plus size={16} aria-hidden /> Pesanan baru</Link>}
      </Judul>
      {akses === "ditolak" && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Peran Anda tidak memiliki akses ke halaman tersebut.
        </p>
      )}
      <Pesan ok={ok} galat={galat} />
      {u.peran === "pemilik" || u.peran === "manajer" ? <RingkasanUsaha /> : <RingkasanOperasional dapur={u.peran === "dapur"} />}
    </>
  );
}

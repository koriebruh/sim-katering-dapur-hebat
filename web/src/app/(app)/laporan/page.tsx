import { Download, Search } from "lucide-react";
import type { Metadata } from "next";
import { Angka, TombolCetak } from "@/components/klien";
import { Judul, kelas, Kosong, Tabel } from "@/components/ui";
import { wajibLogin } from "@/lib/dal";
import { hpUntuk, rupiah, tanggal } from "@/lib/format";
import { penjualanPerMenu, periode, piutang, ringkasan } from "@/lib/laporan";
import { aksesHalaman } from "@/lib/roles";

export const metadata: Metadata = { title: "Laporan" };

export default async function Laporan({ searchParams }: { searchParams: Promise<{ dari?: string; sampai?: string }> }) {
  const u = await wajibLogin(aksesHalaman("/laporan"));
  const { dari, sampai, awal, akhir } = periode(await searchParams);
  const [perMenu, total, utang] = await Promise.all([penjualanPerMenu(awal, akhir), ringkasan(awal, akhir), piutang()]);
  const totalPiutang = utang.reduce((a, p) => a + p.total - p.dibayar, 0);

  return (
    <>
      <Judul judul="Laporan penjualan" sub={`Periode kirim ${tanggal(awal)} sampai ${tanggal(new Date(akhir.getTime() - 1))}`}>
        <TombolCetak className={kelas.tombolGaris} />
        <a href={`/laporan/ekspor?dari=${dari}&sampai=${sampai}`} className={kelas.tombol}><Download size={16} aria-hidden /> Ekspor CSV</a>
      </Judul>

      <form className={`${kelas.kartu} mb-5 flex flex-wrap items-end gap-3 print:hidden`}>
        <div>
          <label className={kelas.label} htmlFor="dari">Dari tanggal kirim</label>
          <input id="dari" name="dari" type="date" required defaultValue={dari} className={kelas.input} />
        </div>
        <div>
          <label className={kelas.label} htmlFor="sampai">Sampai</label>
          <input id="sampai" name="sampai" type="date" required defaultValue={sampai} className={kelas.input} />
        </div>
        <button className={kelas.tombolGaris}><Search size={16} aria-hidden /> Tampilkan</button>
      </form>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {([["Penjualan", total.omzet, "Rp"], ["Jumlah pesanan", total.pesanan, ""], ["Porsi terjual", total.porsi, ""]] as const).map(([label, nilai, awalan]) => (
          <div key={label} className={kelas.kartu}>
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-2xl font-extrabold text-ink"><Angka nilai={nilai} awalan={awalan} /></div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className={`${kelas.kartu} min-w-0 !p-0`} aria-labelledby="h-menu">
          <h2 id="h-menu" className="px-5 pt-5 font-bold text-ink">Penjualan per menu</h2>
          {perMenu.length === 0 ? (
            <Kosong judul="Tidak ada penjualan pada periode ini" isi="Pilih rentang tanggal kirim yang lain." />
          ) : (
            <Tabel kepala={["Menu", "Pesanan", "Porsi", "Penjualan"]} kanan={[1, 2, 3]}>
              {perMenu.map((m) => (
                <tr key={m.nama}>
                  <td className={`${kelas.td} font-medium text-ink`}>{m.nama}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{m.pesanan}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{m.porsi.toLocaleString("id-ID")}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(m.penjualan)}</td>
                </tr>
              ))}
              <tr className="font-extrabold text-ink">
                <td className={kelas.td}>Total</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{total.pesanan}</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{total.porsi.toLocaleString("id-ID")}</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(total.omzet)}</td>
              </tr>
            </Tabel>
          )}
        </section>

        <section className={`${kelas.kartu} h-fit min-w-0 !p-0`} aria-labelledby="h-piutang">
          <h2 id="h-piutang" className="px-5 pt-5 font-bold text-ink">Piutang belum lunas</h2>
          <p className="px-5 text-sm text-muted">Semua pesanan yang belum lunas, tidak dibatasi periode</p>
          {utang.length === 0 ? (
            <Kosong judul="Tidak ada piutang" isi="Semua pesanan sudah lunas." />
          ) : (
            <div className="[&_table]:min-w-0">
              <Tabel kepala={["Pelanggan", "Kirim", "Sisa"]} kanan={[2]}>
                {utang.map((p) => (
                  <tr key={p.kode}>
                    <td className={kelas.td}>
                      <div className="font-medium text-ink">{p.nama}</div>
                      <div className="text-xs tabular-nums text-muted">{p.kode}, {hpUntuk(u.peran, p.noHp)}</div>
                    </td>
                    <td className={`${kelas.td} whitespace-nowrap tabular-nums`}>{tanggal(p.tglKirim)}</td>
                    <td className={`${kelas.td} text-right font-semibold tabular-nums text-red-700`}>{rupiah(p.total - p.dibayar)}</td>
                  </tr>
                ))}
                <tr className="font-extrabold text-ink">
                  <td className={kelas.td} colSpan={2}>Total piutang</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(totalPiutang)}</td>
                </tr>
              </Tabel>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

import { asc, eq } from "drizzle-orm";
import { ArrowLeft, Ban, CheckCircle2, MapPin, Send, StickyNote, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Judul, kelas, Lencana, Pesan, Tabel } from "@/components/ui";
import { db } from "@/db";
import { detailPesanan, menu, pelanggan, pembayaran, pengguna, pesanan, type StatusPesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { hpUntuk, jam, rupiah, tanggal, tanggalPanjang } from "@/lib/format";
import { minimalDp, transisiUntuk } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";
import { tambahPembayaran, ubahStatus } from "../actions";

export const metadata: Metadata = { title: "Detail Pesanan" };

const AKSI: Partial<Record<StatusPesanan, { label: string; Ikon: typeof Send; kelas: string }>> = {
  dikirim: { label: "Tandai dikirim", Ikon: Send, kelas: kelas.tombol },
  selesai: { label: "Tandai selesai", Ikon: CheckCircle2, kelas: kelas.tombol },
  batal: { label: "Batalkan pesanan", Ikon: Ban, kelas: `${kelas.tombolGaris} hover:!border-red-300 hover:!text-red-700` },
};

export default async function DetailPesanan({ params, searchParams }: {
  params: Promise<{ kode: string }>; searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const u = await wajibLogin(aksesHalaman("/pesanan"));
  const { kode } = await params;
  const { ok, galat } = await searchParams;
  if (!/^PSN-\d{4}-\d{3,}$/.test(kode)) notFound();

  const [p] = await db
    .select({
      id: pesanan.id, kode: pesanan.kode, tglPesan: pesanan.tglPesan, tglKirim: pesanan.tglKirim, alamatKirim: pesanan.alamatKirim,
      catatan: pesanan.catatan, total: pesanan.total, status: pesanan.status,
      namaPelanggan: pelanggan.nama, noHp: pelanggan.noHp, pencatat: pengguna.nama,
    })
    .from(pesanan)
    .innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
    .innerJoin(pengguna, eq(pesanan.penggunaId, pengguna.id))
    .where(eq(pesanan.kode, kode)).limit(1);
  if (!p) notFound();

  const [item, bayar] = await Promise.all([
    db.select({ nama: menu.nama, jumlah: detailPesanan.jumlah, hargaSatuan: detailPesanan.hargaSatuan, subtotal: detailPesanan.subtotal })
      .from(detailPesanan).innerJoin(menu, eq(detailPesanan.menuId, menu.id)).where(eq(detailPesanan.pesananId, p.id)).orderBy(asc(detailPesanan.id)),
    db.select({ id: pembayaran.id, tglBayar: pembayaran.tglBayar, jenis: pembayaran.jenis, metode: pembayaran.metode, jumlah: pembayaran.jumlah })
      .from(pembayaran).where(eq(pembayaran.pesananId, p.id)).orderBy(asc(pembayaran.id)),
  ]);
  const dibayar = bayar.reduce((a, b) => a + b.jumlah, 0);
  const sisa = p.total - dibayar;
  const bolehBayar = u.peran === "admin" && p.status !== "batal" && sisa > 0;
  const aksi = transisiUntuk(p.status, u.peran);

  return (
    <>
      <Judul judul={p.kode} sub={`Dicatat ${tanggal(p.tglPesan)} oleh ${p.pencatat}`}>
        <Lencana status={p.status} />
        <Link href="/pesanan" className={kelas.tombolGaris}><ArrowLeft size={16} aria-hidden /> Daftar pesanan</Link>
      </Judul>
      <Pesan ok={ok} galat={galat} />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid min-w-0 gap-5">
          <section className={kelas.kartu} aria-labelledby="h-pengiriman">
            <h2 id="h-pengiriman" className="mb-3 font-bold text-ink">Pengiriman</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Pelanggan</dt><dd className="font-semibold text-ink">{p.namaPelanggan}</dd><dd className="tabular-nums text-muted">{hpUntuk(u.peran, p.noHp)}</dd></div>
              <div><dt className="text-xs text-muted">Waktu kirim</dt><dd className="font-semibold text-ink">{tanggalPanjang(p.tglKirim)}</dd><dd className="text-muted">pukul {jam(p.tglKirim)} WIB</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-muted">Alamat kirim</dt><dd className="flex gap-2 text-ink"><MapPin size={16} aria-hidden className="mt-0.5 shrink-0 text-accent-500" /> {p.alamatKirim}</dd></div>
              {p.catatan && <div className="sm:col-span-2"><dt className="text-xs text-muted">Catatan</dt><dd className="flex gap-2 text-ink"><StickyNote size={16} aria-hidden className="mt-0.5 shrink-0 text-accent-500" /> {p.catatan}</dd></div>}
            </dl>
          </section>

          <section className={`${kelas.kartu} min-w-0 !p-0`} aria-labelledby="h-item">
            <h2 id="h-item" className="px-5 pt-5 font-bold text-ink">Item pesanan</h2>
            <Tabel kepala={["Menu", "Harga", "Jumlah", "Subtotal"]} kanan={[1, 2, 3]}>
              {item.map((d) => (
                <tr key={d.nama}>
                  <td className={`${kelas.td} font-medium text-ink`}>{d.nama}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(d.hargaSatuan)}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{d.jumlah}</td>
                  <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(d.subtotal)}</td>
                </tr>
              ))}
              <tr className="font-extrabold text-ink">
                <td className={kelas.td} colSpan={2}>Total</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{item.reduce((a, d) => a + d.jumlah, 0)}</td>
                <td className={`${kelas.td} text-right tabular-nums`}>{rupiah(p.total)}</td>
              </tr>
            </Tabel>
          </section>

          {aksi.length > 0 && (
            <section className={`${kelas.kartu} flex flex-wrap items-center gap-2`} aria-label="Ubah status">
              {aksi.map((ke) => {
                const a = AKSI[ke]!;
                return (
                  <form key={ke} action={ubahStatus}>
                    <input type="hidden" name="kode" value={p.kode} />
                    <input type="hidden" name="ke" value={ke} />
                    <input type="hidden" name="kembali" value={`/pesanan/${p.kode}`} />
                    <button className={a.kelas}><a.Ikon size={16} aria-hidden /> {a.label}</button>
                  </form>
                );
              })}
            </section>
          )}
        </div>

        <section className={`${kelas.kartu} h-fit`} aria-labelledby="h-bayar">
          <h2 id="h-bayar" className="mb-3 font-bold text-ink">Pembayaran</h2>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Total</dt><dd className="tabular-nums">{rupiah(p.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Sudah dibayar</dt><dd className="tabular-nums">{rupiah(dibayar)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-extrabold">
              <dt>Sisa tagihan</dt><dd className={`tabular-nums ${sisa > 0 && p.status !== "batal" ? "text-red-700" : "text-emerald-700"}`}>{rupiah(sisa)}</dd>
            </div>
          </dl>

          {bayar.length > 0 && (
            <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
              {bayar.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="font-medium text-ink">{b.jenis === "uang_muka" ? "Uang muka" : "Pelunasan"}</span>
                    <span className="block text-xs text-muted">{tanggal(b.tglBayar)}, {b.metode}</span>
                  </span>
                  <span className="tabular-nums">{rupiah(b.jumlah)}</span>
                </li>
              ))}
            </ul>
          )}

          {bolehBayar && (
            <form action={tambahPembayaran} className="mt-5 border-t border-line pt-4">
              <input type="hidden" name="kode" value={p.kode} />
              <label className={kelas.label} htmlFor="jumlah">{dibayar === 0 ? "Uang muka" : "Pelunasan"} diterima (Rp)</label>
              <input
                id="jumlah" name="jumlah" type="number" required min={dibayar === 0 ? minimalDp(p.total) : 1} max={sisa}
                defaultValue={dibayar === 0 ? minimalDp(p.total) : sisa} className={kelas.input}
              />
              <p className="mt-1.5 text-xs text-muted">
                {dibayar === 0 ? `Minimal ${rupiah(minimalDp(p.total))} (50%), maksimal ${rupiah(sisa)}.` : `Maksimal ${rupiah(sisa)}.`}
              </p>
              <label className={`${kelas.label} mt-3`} htmlFor="metode">Metode</label>
              <select id="metode" name="metode" defaultValue="transfer" className={kelas.input}>
                <option value="transfer">Transfer bank</option>
                <option value="tunai">Tunai</option>
              </select>
              <button className={`${kelas.tombol} mt-4 w-full`}><Wallet size={16} aria-hidden /> Catat pembayaran</button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

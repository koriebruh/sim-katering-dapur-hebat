"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { kelas } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { hitungTotal, minimalDp } from "@/lib/pesanan";
import { buatPesanan } from "../actions";

type Baris = { kunci: number; menuId: number; jumlah: string };

export function FormPesanan({ pelanggan, menu, hariIni }: {
  pelanggan: { id: number; nama: string; alamat: string }[];
  menu: { id: number; nama: string; harga: number }[];
  hariIni: string;
}) {
  const [state, action, pending] = useActionState(buatPesanan, undefined);
  const [baris, setBaris] = useState<Baris[]>([{ kunci: 1, menuId: menu[0]?.id ?? 0, jumlah: "25" }]);
  const [alamat, setAlamat] = useState("");
  const [dp, setDp] = useState("");

  const harga = (id: number) => menu.find((m) => m.id === id)?.harga ?? 0;
  const angka = (s: string) => Math.max(0, Math.floor(Number(s) || 0));
  // Hanya pratinjau; angka yang disimpan dihitung ulang di server dari harga di database.
  const total = hitungTotal(baris.map((b) => ({ hargaSatuan: harga(b.menuId), jumlah: angka(b.jumlah) })));
  const porsi = baris.reduce((a, b) => a + angka(b.jumlah), 0);
  const ubah = (kunci: number, isi: Partial<Baris>) => setBaris((bs) => bs.map((b) => (b.kunci === kunci ? { ...b, ...isi } : b)));

  if (!pelanggan.length || !menu.length) {
    return (
      <p className={kelas.kartu}>
        Tambahkan dulu {pelanggan.length ? "menu yang dijual" : "pelanggan"} di halaman{" "}
        <Link className="font-semibold text-accent-600 underline" href={pelanggan.length ? "/menu-paket" : "/pelanggan"}>
          {pelanggan.length ? "Menu & Paket" : "Pelanggan"}
        </Link>.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className={kelas.kartu}>
        <h2 className="mb-4 font-bold text-ink">Data pesanan</h2>
        <label className={kelas.label} htmlFor="pelangganId">Pelanggan</label>
        <select
          id="pelangganId" name="pelangganId" required defaultValue="" className={kelas.input}
          onChange={(e) => setAlamat(pelanggan.find((p) => String(p.id) === e.target.value)?.alamat ?? "")}
        >
          <option value="" disabled>Pilih pelanggan</option>
          {pelanggan.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>
        <p className="mt-1.5 text-xs text-muted">Pelanggan baru? Tambahkan di halaman <Link href="/pelanggan" className="underline">Pelanggan</Link>.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={kelas.label} htmlFor="tgl">Tanggal kirim</label>
            <input id="tgl" name="tgl" type="date" required min={hariIni} defaultValue={hariIni} className={kelas.input} />
          </div>
          <div>
            <label className={kelas.label} htmlFor="jam">Jam kirim (WIB)</label>
            <input id="jam" name="jam" type="time" required defaultValue="11:00" className={kelas.input} />
          </div>
        </div>

        <label className={`${kelas.label} mt-4`} htmlFor="alamatKirim">Alamat kirim</label>
        <input id="alamatKirim" name="alamatKirim" required minLength={5} maxLength={150} value={alamat} onChange={(e) => setAlamat(e.target.value)} className={kelas.input} />

        <h2 className="mb-3 mt-6 font-bold text-ink">Item pesanan</h2>
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {baris.map((b, i) => (
              <motion.li
                key={b.kunci} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[1fr_96px_auto] items-end gap-2 sm:grid-cols-[1fr_110px_130px_auto]"
              >
                <div>
                  <label className={kelas.label} htmlFor={`menu-${b.kunci}`}>Menu {i + 1}</label>
                  <select id={`menu-${b.kunci}`} name="menuId" value={b.menuId} onChange={(e) => ubah(b.kunci, { menuId: Number(e.target.value) })} className={kelas.input}>
                    {menu.map((m) => <option key={m.id} value={m.id}>{m.nama} — {rupiah(m.harga)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={kelas.label} htmlFor={`jumlah-${b.kunci}`}>Jumlah</label>
                  <input id={`jumlah-${b.kunci}`} name="jumlah" type="number" required min={1} max={5000} value={b.jumlah} onChange={(e) => ubah(b.kunci, { jumlah: e.target.value })} className={`${kelas.input} text-right`} />
                </div>
                <div className="hidden pb-2.5 text-right text-sm font-semibold tabular-nums text-ink sm:block">{rupiah(harga(b.menuId) * angka(b.jumlah))}</div>
                <button
                  type="button" disabled={baris.length === 1} aria-label={`Hapus menu ${i + 1}`}
                  onClick={() => setBaris((bs) => bs.filter((x) => x.kunci !== b.kunci))}
                  className="mb-0.5 grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:border-red-300 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <button
          type="button" disabled={baris.length >= 20} className={`${kelas.tombolKecil} mt-3`}
          onClick={() => setBaris((bs) => [...bs, { kunci: Math.max(...bs.map((x) => x.kunci)) + 1, menuId: menu[0].id, jumlah: "25" }])}
        >
          <Plus size={13} aria-hidden /> Tambah menu
        </button>

        <label className={`${kelas.label} mt-6`} htmlFor="catatan">Catatan untuk dapur (opsional)</label>
        <input id="catatan" name="catatan" maxLength={200} placeholder="mis. sambal dipisah" className={kelas.input} />
      </div>

      <div className={`${kelas.kartu} h-fit xl:sticky xl:top-6`}>
        <h2 className="mb-4 font-bold text-ink">Ringkasan pembayaran</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Total porsi</dt><dd className="tabular-nums">{porsi}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold">
            <dt>Total</dt>
            <motion.dd key={total} initial={{ scale: 1.08, color: "var(--color-accent-600)" }} animate={{ scale: 1, color: "var(--color-ink)" }} className="tabular-nums">{rupiah(total)}</motion.dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <label className={kelas.label} htmlFor="dp">Uang muka diterima (Rp)</label>
            <input id="dp" name="dp" type="number" min={0} step={500} value={dp} onChange={(e) => setDp(e.target.value)} placeholder="0 jika belum dibayar" className={kelas.input} />
          </div>
          <button type="button" className={`${kelas.tombolGaris} !py-2.5`} onClick={() => setDp(String(minimalDp(total)))}>50%</button>
        </div>
        <p className="mt-1.5 text-xs text-muted">Minimal {rupiah(minimalDp(total))}. Tanpa uang muka, pesanan berstatus menunggu DP dan belum masuk jadwal dapur.</p>

        <label className={`${kelas.label} mt-4`} htmlFor="metode">Metode</label>
        <select id="metode" name="metode" defaultValue="transfer" className={kelas.input}>
          <option value="transfer">Transfer bank</option>
          <option value="tunai">Tunai</option>
        </select>

        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted">Sisa tagihan</span>
          <b className="tabular-nums">{rupiah(Math.max(0, total - angka(dp)))}</b>
        </div>

        <p role="alert" aria-live="polite" className={`mt-4 text-sm text-red-700 ${state?.pesan ? "rounded-xl border border-red-200 bg-red-50 px-3 py-2.5" : ""}`}>{state?.pesan}</p>

        <div className="mt-4 flex gap-2">
          <button disabled={pending} className={`${kelas.tombol} flex-1`}>
            {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
            {pending ? "Menyimpan…" : "Simpan pesanan"}
          </button>
          <Link href="/pesanan" className={kelas.tombolGaris}>Batal</Link>
        </div>
      </div>
    </form>
  );
}

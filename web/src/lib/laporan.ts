import "server-only";
import { and, asc, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { detailPesanan, menu, pelanggan, pesanan } from "@/db/schema";
import { rentangHari, tanggalSah, tanggalWib } from "./pesanan";

// Penjualan diakui pada tanggal kirim; pesanan batal tidak dihitung.

/** Periode dari query string; bawaan: awal sampai akhir bulan berjalan (WIB). */
export function periode(sp: { dari?: string; sampai?: string }) {
  const hariIni = tanggalWib();
  const [y, m] = hariIni.split("-").map(Number);
  const akhirBulan = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let dari = tanggalSah(sp.dari) ? sp.dari : `${hariIni.slice(0, 8)}01`;
  let sampai = tanggalSah(sp.sampai) ? sp.sampai : `${hariIni.slice(0, 8)}${String(akhirBulan).padStart(2, "0")}`;
  if (dari > sampai) [dari, sampai] = [sampai, dari];
  return { dari, sampai, awal: rentangHari(dari)[0], akhir: rentangHari(sampai)[1] };
}

const dalam = (awal: Date, akhir: Date) =>
  and(ne(pesanan.status, "batal"), gte(pesanan.tglKirim, awal), lt(pesanan.tglKirim, akhir));

export function penjualanPerMenu(awal: Date, akhir: Date) {
  const penjualan = sql<number>`sum(${detailPesanan.subtotal})::int`;
  return db
    .select({
      nama: menu.nama, foto: menu.foto,
      pesanan: sql<number>`count(distinct ${detailPesanan.pesananId})::int`,
      porsi: sql<number>`sum(${detailPesanan.jumlah})::int`,
      penjualan,
    })
    .from(detailPesanan)
    .innerJoin(pesanan, eq(detailPesanan.pesananId, pesanan.id))
    .innerJoin(menu, eq(detailPesanan.menuId, menu.id))
    .where(dalam(awal, akhir)).groupBy(menu.id).orderBy(desc(penjualan), asc(menu.id));
}

export async function ringkasan(awal: Date, akhir: Date) {
  const [r] = await db
    .select({
      omzet: sql<number>`coalesce(sum(${pesanan.total}), 0)::int`,
      pesanan: sql<number>`count(*)::int`,
      porsi: sql<number>`coalesce(sum((select sum(d.jumlah) from detail_pesanan d where d.pesanan_id = ${pesanan.id})), 0)::int`,
    })
    .from(pesanan).where(dalam(awal, akhir));
  return r;
}

/** Semua pesanan yang belum lunas, terlama lebih dulu. */
export function piutang() {
  const dibayar = sql<number>`coalesce((select sum(b.jumlah) from pembayaran b where b.pesanan_id = ${pesanan.id}), 0)::int`;
  return db
    .select({ kode: pesanan.kode, nama: pelanggan.nama, noHp: pelanggan.noHp, tglKirim: pesanan.tglKirim, total: pesanan.total, dibayar })
    .from(pesanan).innerJoin(pelanggan, eq(pesanan.pelangganId, pelanggan.id))
    .where(and(ne(pesanan.status, "batal"), sql`${pesanan.total} > ${dibayar}`))
    .orderBy(asc(pesanan.tglKirim));
}

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Omzet n bulan terakhir termasuk bulan berjalan; bulan tanpa pesanan bernilai 0. */
export async function omzetBulanan(n = 6) {
  const [y, m] = tanggalWib().split("-").map(Number);
  const kunci = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const bulan = sql<string>`to_char(${pesanan.tglKirim} at time zone 'Asia/Jakarta', 'YYYY-MM')`;
  const baris = await db
    .select({ bulan, nilai: sql<number>`sum(${pesanan.total})::int` })
    .from(pesanan)
    .where(and(ne(pesanan.status, "batal"), gte(pesanan.tglKirim, rentangHari(`${kunci[0]}-01`)[0])))
    .groupBy(bulan);
  const peta = new Map(baris.map((b) => [b.bulan, b.nilai]));
  return kunci.map((k) => ({ label: BULAN[Number(k.slice(5)) - 1], nilai: peta.get(k) ?? 0 }));
}

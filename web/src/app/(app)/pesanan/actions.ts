"use server";

import { and, eq, inArray, like, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { detailPesanan, menu, pelanggan, pembayaran, pesanan, statusPesananEnum } from "@/db/schema";
import { catatAudit, wajibLogin } from "@/lib/dal";
import {
  awalanKode, BERHASIL, bolehTransisi, cekPembayaran, GALAT, Galat, hitungTotal, minimalDp, pathAman, rentangHari, tanggalWib,
} from "@/lib/pesanan";

export type StatusForm = { pesan: string } | undefined;

const Baris = z.object({ menuId: z.coerce.number().int().positive(), jumlah: z.coerce.number().int().min(1).max(5000) });
const SkemaPesanan = z.object({
  pelangganId: z.coerce.number().int().positive(),
  tgl: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jam: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  alamatKirim: z.string().trim().min(5).max(150),
  catatan: z.string().trim().max(200),
  item: z.array(Baris).min(1).max(20),
  dp: z.coerce.number().int().min(0).max(1_000_000_000),
  metode: z.enum(["tunai", "transfer"]),
});

/** F-04 + F-05: menyimpan pesanan; total selalu dihitung server dari harga di database. */
export async function buatPesanan(_: StatusForm, f: FormData): Promise<StatusForm> {
  const u = await wajibLogin(["admin"]);
  const jumlah = f.getAll("jumlah");
  const d = SkemaPesanan.safeParse({
    pelangganId: f.get("pelangganId"), tgl: f.get("tgl"), jam: f.get("jam"), alamatKirim: f.get("alamatKirim"),
    catatan: f.get("catatan") ?? "", dp: f.get("dp") || 0, metode: f.get("metode") ?? "transfer",
    item: f.getAll("menuId").map((menuId, i) => ({ menuId, jumlah: jumlah[i] })),
  });
  if (!d.success) return { pesan: "Lengkapi pelanggan, tanggal, jam, alamat kirim (minimal 5 karakter), dan minimal satu menu dengan jumlah 1–5.000." };
  const v = d.data;

  const kirim = new Date(`${v.tgl}T${v.jam}:00+07:00`);
  if (Number.isNaN(kirim.getTime())) return { pesan: "Tanggal kirim tidak valid." };
  if (kirim < rentangHari(tanggalWib())[0]) return { pesan: "Tanggal kirim tidak valid: sudah lewat." };

  // menu yang sama pada dua baris digabung
  const porsi = new Map<number, number>();
  for (const b of v.item) porsi.set(b.menuId, (porsi.get(b.menuId) ?? 0) + b.jumlah);

  let kode: string;
  try {
    kode = await db.transaction(async (tx) => {
      // satu pembuatan pesanan pada satu waktu, agar nomor urut kode tidak kembar
      await tx.execute(sql`select pg_advisory_xact_lock(7001)`);
      const [c] = await tx.select({ id: pelanggan.id }).from(pelanggan).where(eq(pelanggan.id, v.pelangganId)).limit(1);
      if (!c) throw new Galat("Pelanggan tidak ditemukan.");
      const daftar = await tx.select({ id: menu.id, harga: menu.harga }).from(menu)
        .where(and(inArray(menu.id, [...porsi.keys()]), eq(menu.aktif, true)));
      if (daftar.length !== porsi.size) throw new Galat("Ada menu yang tidak tersedia. Muat ulang halaman lalu pilih lagi.");

      const detail = daftar.map((m) => ({ menuId: m.id, jumlah: porsi.get(m.id)!, hargaSatuan: m.harga, subtotal: m.harga * porsi.get(m.id)! }));
      const total = hitungTotal(detail);
      if (v.dp > 0) {
        const galat = cekPembayaran({ total, dibayar: 0, jumlah: v.dp, status: "menunggu_dp" });
        if (galat) throw new Galat(`${galat} Total pesanan Rp${total.toLocaleString("id-ID")}, uang muka minimal Rp${minimalDp(total).toLocaleString("id-ID")}.`);
      }

      const awalan = awalanKode(kirim);
      const [{ n }] = await tx.select({ n: sql<number>`coalesce(max(substring(${pesanan.kode} from 10)::int), 0)` })
        .from(pesanan).where(like(pesanan.kode, `${awalan}-%`));
      const kodeBaru = `${awalan}-${String(n + 1).padStart(3, "0")}`;

      const [p] = await tx.insert(pesanan).values({
        kode: kodeBaru, pelangganId: c.id, penggunaId: u.id, tglPesan: tanggalWib(), tglKirim: kirim,
        alamatKirim: v.alamatKirim, catatan: v.catatan, total, status: v.dp > 0 ? "diproses" : "menunggu_dp",
      }).returning({ id: pesanan.id });
      await tx.insert(detailPesanan).values(detail.map((x) => ({ ...x, pesananId: p.id })));
      if (v.dp > 0) {
        await tx.insert(pembayaran).values({ pesananId: p.id, penggunaId: u.id, tglBayar: tanggalWib(), jenis: "uang_muka", metode: v.metode, jumlah: v.dp });
      }
      await catatAudit(tx, u.id, "buat", "pesanan", kodeBaru, { total, dp: v.dp });
      return kodeBaru;
    });
  } catch (e) {
    if (e instanceof Galat) return { pesan: e.message };
    throw e;
  }
  redirect(`/pesanan/${kode}?ok=${encodeURIComponent(BERHASIL.dibuat)}`);
}

const SkemaBayar = z.object({
  kode: z.string().regex(/^PSN-\d{4}-\d{3,}$/),
  jumlah: z.coerce.number().int(),
  metode: z.enum(["tunai", "transfer"]),
});

/** F-05: mencatat uang muka atau pelunasan. Baris pesanan dikunci agar dua pembayaran bersamaan tidak melebihi sisa. */
export async function tambahPembayaran(f: FormData) {
  const u = await wajibLogin(["admin"]);
  const d = SkemaBayar.safeParse({ kode: f.get("kode"), jumlah: f.get("jumlah"), metode: f.get("metode") });
  if (!d.success) redirect(`/pesanan?galat=${encodeURIComponent(GALAT.bayarNol)}`);
  const { kode, jumlah, metode } = d.data;
  const balik = (q: string) => redirect(`/pesanan/${kode}?${q}`);

  let galat: string | null = null;
  await db.transaction(async (tx) => {
    const [p] = await tx.select({ id: pesanan.id, total: pesanan.total, status: pesanan.status })
      .from(pesanan).where(eq(pesanan.kode, kode)).for("update");
    if (!p) { galat = GALAT.tidakAda; return; }
    const [{ dibayar }] = await tx.select({ dibayar: sql<number>`coalesce(sum(${pembayaran.jumlah}), 0)::int` })
      .from(pembayaran).where(eq(pembayaran.pesananId, p.id));
    galat = cekPembayaran({ total: p.total, dibayar, jumlah, status: p.status });
    if (galat) return;
    await tx.insert(pembayaran).values({
      pesananId: p.id, penggunaId: u.id, tglBayar: tanggalWib(), jenis: dibayar === 0 ? "uang_muka" : "pelunasan", metode, jumlah,
    });
    if (p.status === "menunggu_dp") await tx.update(pesanan).set({ status: "diproses" }).where(eq(pesanan.id, p.id));
    await catatAudit(tx, u.id, "bayar", "pesanan", kode, { jumlah, metode });
  });
  balik(galat ? `galat=${encodeURIComponent(galat)}` : `ok=${encodeURIComponent(BERHASIL.dibayar)}`);
}

const SkemaStatus = z.object({ kode: z.string().regex(/^PSN-\d{4}-\d{3,}$/), ke: z.enum(statusPesananEnum.enumValues) });

/** F-07: mengubah status sesuai aturan transisi dan peran. */
export async function ubahStatus(f: FormData) {
  const u = await wajibLogin(["admin", "dapur"]);
  const d = SkemaStatus.safeParse({ kode: f.get("kode"), ke: f.get("ke") });
  const tujuan = pathAman(f.get("kembali"), "/dashboard");
  const sambung = tujuan.includes("?") ? "&" : "?";
  if (!d.success) redirect(`${tujuan}${sambung}galat=${encodeURIComponent(GALAT.status)}`);
  const { kode, ke } = d.data;

  let galat: string | null = null;
  await db.transaction(async (tx) => {
    const [p] = await tx.select({ id: pesanan.id, status: pesanan.status }).from(pesanan).where(eq(pesanan.kode, kode)).for("update");
    if (!p) { galat = GALAT.tidakAda; return; }
    if (!bolehTransisi(p.status, ke, u.peran)) { galat = GALAT.status; return; }
    await tx.update(pesanan).set({ status: ke }).where(eq(pesanan.id, p.id));
    await catatAudit(tx, u.id, "status", "pesanan", kode, { dari: p.status, ke });
  });
  redirect(`${tujuan}${sambung}${galat ? `galat=${encodeURIComponent(galat)}` : `ok=${encodeURIComponent(BERHASIL.status)}`}`);
}

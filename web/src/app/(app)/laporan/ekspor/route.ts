import type { NextRequest } from "next/server";
import { wajibLogin } from "@/lib/dal";
import { penjualanPerMenu, periode } from "@/lib/laporan";
import { selCsv } from "@/lib/pesanan";
import { aksesHalaman } from "@/lib/roles";

/** F-09: ekspor laporan penjualan per menu sebagai CSV (dapat dibuka di Excel). */
export async function GET(req: NextRequest) {
  await wajibLogin(aksesHalaman("/laporan"));
  const q = req.nextUrl.searchParams;
  const { dari, sampai, awal, akhir } = periode({ dari: q.get("dari") ?? undefined, sampai: q.get("sampai") ?? undefined });
  const baris = await penjualanPerMenu(awal, akhir);

  const isi = [
    ["Menu", "Pesanan", "Porsi", "Penjualan"],
    ...baris.map((b) => [b.nama, b.pesanan, b.porsi, b.penjualan]),
    ["Total", "", baris.reduce((a, b) => a + b.porsi, 0), baris.reduce((a, b) => a + b.penjualan, 0)],
  ].map((r) => r.map(selCsv).join(",")).join("\r\n");

  // BOM agar Excel membaca UTF-8
  return new Response("﻿" + isi, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="penjualan-${dari}-sd-${sampai}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

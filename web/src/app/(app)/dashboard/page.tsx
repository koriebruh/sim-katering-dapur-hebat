import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { pesanan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { tanggalPanjang } from "@/lib/format";
import { LABEL_PERAN } from "@/lib/roles";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ akses?: string }> }) {
  const u = await wajibLogin();
  const { akses } = await searchParams;
  const [r] = await db.select({
    menungguDp: sql<number>`count(*) filter (where ${pesanan.status} = 'menunggu_dp')::int`,
    diproses: sql<number>`count(*) filter (where ${pesanan.status} = 'diproses')::int`,
    dikirim: sql<number>`count(*) filter (where ${pesanan.status} = 'dikirim')::int`,
    selesai: sql<number>`count(*) filter (where ${pesanan.status} = 'selesai')::int`,
  }).from(pesanan);

  const kartu = [
    ["Menunggu uang muka", r.menungguDp], ["Sedang diproses", r.diproses],
    ["Sedang dikirim", r.dikirim], ["Selesai", r.selesai],
  ] as const;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard {LABEL_PERAN[u.peran]}</h1>
          <p className="text-sm text-muted">{tanggalPanjang(new Date())}</p>
        </div>
      </header>
      {akses === "ditolak" && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Peran Anda tidak memiliki akses ke halaman tersebut.
        </p>
      )}
      <section aria-label="Ringkasan pesanan" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-line bg-white p-5">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-3xl font-bold text-ink">{n}</div>
          </div>
        ))}
      </section>
    </>
  );
}

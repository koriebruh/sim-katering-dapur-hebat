import type { StatusPesanan } from "@/db/schema";
import { BERHASIL, GALAT, LABEL_STATUS } from "@/lib/pesanan";
import { GambarKosong } from "./ilustrasi";

export const kelas = {
  input:
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent-500 focus:ring-4 focus:ring-accent-100",
  tombol:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-500/30 transition hover:bg-accent-600 active:scale-[0.97] disabled:opacity-60",
  tombolGaris:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent-500 hover:text-accent-600 active:scale-[0.97]",
  tombolKecil:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent-500 hover:text-accent-600 active:scale-[0.97]",
  kartu: "rounded-2xl border border-line bg-white p-5 shadow-[0_1px_3px_rgb(28_25_23/0.05)]",
  label: "mb-1.5 block text-xs font-medium text-muted",
  th: "whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted",
  td: "px-4 py-3 align-top",
};

export function Judul({ judul, sub, children }: { judul: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{judul}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 print:hidden">{children}</div>}
    </header>
  );
}

const WARNA: Record<StatusPesanan, string> = {
  menunggu_dp: "bg-red-50 text-red-700 ring-red-200",
  diproses: "bg-amber-50 text-amber-800 ring-amber-200",
  dikirim: "bg-sky-50 text-sky-800 ring-sky-200",
  selesai: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  batal: "bg-stone-100 text-stone-600 ring-stone-200",
};

export function Lencana({ status }: { status: StatusPesanan }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${WARNA[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden /> {LABEL_STATUS[status]}
    </span>
  );
}

/** Pesan hasil aksi dari query string (?ok= / ?galat=). */
export function Pesan({ ok, galat }: { ok?: string; galat?: string }) {
  // Hanya teks yang dikenal yang ditampilkan, supaya tautan buatan orang lain tidak bisa menyisipkan pesan.
  if (galat) {
    const teks = (Object.values(GALAT) as string[]).includes(galat) ? galat : "Aksi gagal. Periksa isian lalu coba lagi.";
    return <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{teks}</p>;
  }
  if (ok && (Object.values(BERHASIL) as string[]).includes(ok)) {
    return <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>;
  }
  return null;
}

export function Kosong({ judul, isi, children }: { judul: string; isi: string; children?: React.ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <GambarKosong />
      <p className="mt-4 font-bold text-ink">{judul}</p>
      <p className="mt-1 max-w-[42ch] text-sm text-muted">{isi}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Tabel({ kepala, children, kanan = [] }: { kepala: string[]; children: React.ReactNode; kanan?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-line">
            {kepala.map((k, i) => <th key={k + i} scope="col" className={`${kelas.th} ${kanan.includes(i) ? "text-right" : ""}`}>{k}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">{children}</tbody>
      </table>
    </div>
  );
}

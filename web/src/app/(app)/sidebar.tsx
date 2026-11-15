"use client";

import { CalendarClock, ClipboardList, FileBarChart, LayoutDashboard, LogOut, Users, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { keluar } from "@/app/login/actions";
import { Logo } from "@/components/ilustrasi";
import type { Ikon } from "@/lib/roles";

const IKON: Record<Ikon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard, pesanan: ClipboardList, jadwal: CalendarClock,
  menu: UtensilsCrossed, pelanggan: Users, laporan: FileBarChart,
};

type Nav = { href: string; label: string; ikon: Ikon };

export function Sidebar({ nav, nama, peran }: { nav: Nav[]; nama: string; peran: string }) {
  const path = usePathname();
  const aktif = (n: Nav) => path === n.href || path.startsWith(n.href + "/");

  return (
    <>
      {/* Desktop: panel putih di kiri */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2 text-lg font-extrabold text-ink">
          <Logo /> Dapur Hebat
        </Link>
        <nav aria-label="Menu utama" className="mt-6 grid gap-1">
          {nav.map((n) => {
            const I = IKON[n.ikon];
            const a = aktif(n);
            return (
              <Link key={n.href} href={n.href} aria-current={a ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${a ? "font-semibold text-accent-600" : "text-muted hover:bg-cream hover:text-ink"}`}>
                {a && <motion.span layoutId="pil-aktif" className="absolute inset-0 rounded-xl bg-accent-100" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <I size={18} aria-hidden className="relative" /> <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-accent-100 to-white p-4 ring-1 ring-inset ring-line">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-accent-500 font-bold text-white" aria-hidden>{nama.replace(/^(Ibu|Bapak|Hj\.|H\.)\s+/i, "")[0]}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{nama}</span>
              <span className="block truncate text-xs text-muted">{peran}</span>
            </span>
          </div>
          <form action={keluar}>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent-500 hover:text-accent-600">
              <LogOut size={15} aria-hidden /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Ponsel: bilah atas dan tab bawah */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:hidden print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-ink"><Logo size={24} /> Dapur Hebat</Link>
        <form action={keluar}>
          <button aria-label="Keluar" className="grid size-9 place-items-center rounded-xl border border-line text-muted"><LogOut size={16} aria-hidden /></button>
        </form>
      </header>
      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden">
        {nav.map((n) => {
          const I = IKON[n.ikon];
          const a = aktif(n);
          return (
            <Link key={n.href} href={n.href} aria-current={a ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] ${a ? "font-semibold text-accent-600" : "text-muted"}`}>
              <I size={19} aria-hidden /> <span className="max-w-full truncate">{n.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

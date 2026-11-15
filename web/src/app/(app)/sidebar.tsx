"use client";

import { CalendarClock, ClipboardList, FileBarChart, LayoutDashboard, LogOut, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { keluar } from "@/app/login/actions";
import type { Ikon } from "@/lib/roles";

const IKON: Record<Ikon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard, pesanan: ClipboardList, jadwal: CalendarClock,
  menu: UtensilsCrossed, pelanggan: Users, laporan: FileBarChart,
};

export function Sidebar({ nav, nama, peran }: {
  nav: { href: string; label: string; ikon: Ikon }[]; nama: string; peran: string;
}) {
  const path = usePathname();
  return (
    <aside className="flex shrink-0 flex-col bg-brand-800 text-brand-100 md:min-h-dvh md:w-56">
      <div className="px-5 pb-2 pt-5">
        <div className="text-lg font-bold text-white">Dapur Hebat</div>
        <div className="text-xs opacity-70">SIM Pemesanan &amp; Produksi</div>
      </div>
      <nav aria-label="Menu utama" className="flex gap-1 overflow-x-auto px-2 py-2 md:mt-3 md:flex-col md:px-0">
        {nav.map((n) => {
          const I = IKON[n.ikon];
          const aktif = path === n.href || path.startsWith(n.href + "/");
          return (
            <Link
              key={n.href} href={n.href} aria-current={aktif ? "page" : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition md:rounded-none md:px-5 ${
                aktif ? "bg-accent-500 font-semibold text-white" : "hover:bg-white/10"
              }`}
            >
              <I size={17} aria-hidden /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-5 md:block">
        <div className="text-sm font-semibold text-white">{nama}</div>
        <div className="text-xs opacity-70">{peran}</div>
        <form action={keluar}>
          <button className="mt-3 flex items-center gap-2 text-sm opacity-80 transition hover:opacity-100">
            <LogOut size={15} aria-hidden /> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

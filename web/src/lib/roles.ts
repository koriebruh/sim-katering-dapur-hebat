import type { Peran } from "@/db/schema";

export const LABEL_PERAN: Record<Peran, string> = {
  admin: "Admin Pemesanan",
  dapur: "Kepala Dapur",
  manajer: "Manajer Operasional",
  pemilik: "Pemilik",
};

export type Ikon = "dashboard" | "pesanan" | "jadwal" | "menu" | "pelanggan" | "laporan";

/** Satu sumber kebenaran hak akses halaman; dipakai sidebar dan wajibLogin() tiap halaman. */
export const NAV: { href: string; label: string; ikon: Ikon; peran: readonly Peran[] }[] = [
  { href: "/dashboard", label: "Dashboard", ikon: "dashboard", peran: ["admin", "dapur", "manajer", "pemilik"] },
  { href: "/pesanan", label: "Pesanan", ikon: "pesanan", peran: ["admin", "manajer"] },
  { href: "/jadwal", label: "Jadwal Produksi", ikon: "jadwal", peran: ["dapur", "admin"] },
  { href: "/menu-paket", label: "Menu & Paket", ikon: "menu", peran: ["admin"] },
  { href: "/pelanggan", label: "Pelanggan", ikon: "pelanggan", peran: ["admin"] },
  { href: "/laporan", label: "Laporan", ikon: "laporan", peran: ["manajer", "pemilik"] },
];

export const aksesHalaman = (href: string) => NAV.find((n) => n.href === href)!.peran;

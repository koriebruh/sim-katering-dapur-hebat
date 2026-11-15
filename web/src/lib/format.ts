import type { Peran } from "@/db/schema";

export const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

/** 081255500142 -> 0812-****-142. Nomor terlalu pendek disamarkan seluruhnya. */
export function samarkanHp(noHp: string) {
  const d = noHp.replace(/\D/g, "");
  if (d.length < 8) return "*".repeat(d.length);
  return `${d.slice(0, 4)}-****-${d.slice(-3)}`;
}

export function formatHp(noHp: string) {
  const d = noHp.replace(/\D/g, "");
  return d.length < 8 ? d : `${d.slice(0, 4)}-${d.slice(4, -3)}-${d.slice(-3)}`;
}

/** Hanya admin yang perlu menghubungi pelanggan; peran lain melihat nomor tersamar. */
export const hpUntuk = (peran: Peran, noHp: string) => (peran === "admin" ? formatHp(noHp) : samarkanHp(noHp));

const ZONA = "Asia/Jakarta";
export const tanggal = (d: Date | string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA });
export const jam = (d: Date | string) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: ZONA });
export const tanggalPanjang = (d: Date | string) =>
  new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: ZONA });

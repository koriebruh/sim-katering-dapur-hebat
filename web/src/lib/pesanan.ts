// Aturan bisnis pesanan. Murni (tanpa database) supaya bisa diuji langsung.
import type { Peran, StatusPesanan } from "@/db/schema";

/** Kesalahan yang pesannya aman ditampilkan ke pengguna. */
export class Galat extends Error {}

/** Semua pesan yang boleh ditampilkan dari query string; teks lain diabaikan halaman. */
export const GALAT = {
  bayarBatal: "Pesanan sudah dibatalkan.",
  bayarNol: "Jumlah pembayaran harus lebih dari nol.",
  lunas: "Pesanan sudah lunas.",
  lebihSisa: "Jumlah melebihi sisa tagihan.",
  dpKurang: "Uang muka minimal 50% dari total.",
  menu: "Isian menu belum benar: nama 3–50 karakter, komposisi wajib diisi, harga Rp1.000–Rp1.000.000.",
  menuGanda: "Nama menu sudah dipakai.",
  pelanggan: "Isian pelanggan belum benar: nama minimal 2 karakter dan nomor HP wajib diisi (diawali 0, 9–14 digit).",
  status: "Perubahan status tidak diizinkan.",
  tidakAda: "Data tidak ditemukan.",
  foto: "Foto harus berupa JPG, PNG, atau WebP dan paling besar 2 MB.",
  menuDipakai: "Menu sudah pernah dipesan sehingga tidak bisa dihapus. Hilangkan centang Dijual agar tidak tampil lagi.",
  pelangganDipakai: "Pelanggan sudah memiliki pesanan sehingga tidak bisa dihapus.",
} as const;
export const BERHASIL = {
  disimpan: "Data tersimpan.",
  dibuat: "Pesanan tersimpan.",
  dibayar: "Pembayaran tercatat.",
  status: "Status pesanan diperbarui.",
  dihapus: "Data dihapus.",
} as const;

export const MAKS_FOTO = 2 * 1024 * 1024;
/** Jenis gambar dikenali dari byte awal file, bukan dari nama atau tipe yang dikirim peramban. */
export function jenisGambar(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length < 12 || b.length > MAKS_FOTO) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const teks = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  if (teks(0, 4) === "RIFF" && teks(8, 4) === "WEBP") return "image/webp";
  return null;
}

export const LABEL_STATUS: Record<StatusPesanan, string> = {
  menunggu_dp: "Menunggu DP", diproses: "Diproses", dikirim: "Dikirim", selesai: "Selesai", batal: "Batal",
};

export const hitungTotal = (baris: { hargaSatuan: number; jumlah: number }[]) =>
  baris.reduce((a, b) => a + b.hargaSatuan * b.jumlah, 0);

/** Uang muka minimal 50% dari total, dibulatkan ke atas. */
export const minimalDp = (total: number) => Math.ceil(total / 2);

/** Mengembalikan pesan kesalahan, atau null jika pembayaran boleh dicatat. */
export function cekPembayaran(p: { total: number; dibayar: number; jumlah: number; status: StatusPesanan }): string | null {
  if (p.status === "batal") return GALAT.bayarBatal;
  if (!Number.isInteger(p.jumlah) || p.jumlah <= 0) return GALAT.bayarNol;
  const sisa = p.total - p.dibayar;
  if (sisa <= 0) return GALAT.lunas;
  if (p.jumlah > sisa) return GALAT.lebihSisa;
  if (p.dibayar === 0 && p.jumlah < minimalDp(p.total)) return GALAT.dpKurang;
  return null;
}

const TRANSISI: Record<StatusPesanan, Partial<Record<StatusPesanan, readonly Peran[]>>> = {
  // menunggu_dp -> diproses hanya terjadi lewat pencatatan uang muka
  menunggu_dp: { batal: ["admin"] },
  diproses: { dikirim: ["admin", "dapur"], batal: ["admin"] },
  dikirim: { selesai: ["admin", "dapur"] },
  selesai: {},
  batal: {},
};

export const bolehTransisi = (dari: StatusPesanan, ke: StatusPesanan, peran: Peran) =>
  TRANSISI[dari][ke]?.includes(peran) ?? false;

export const transisiUntuk = (dari: StatusPesanan, peran: Peran) =>
  (Object.keys(TRANSISI[dari]) as StatusPesanan[]).filter((ke) => bolehTransisi(dari, ke, peran));

const ZONA = "Asia/Jakarta";
/** Tanggal YYYY-MM-DD menurut WIB. */
export const tanggalWib = (d: Date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(d);
/** Awal dan akhir (eksklusif) satu hari WIB. */
export function rentangHari(tgl: string): [Date, Date] {
  const awal = new Date(`${tgl}T00:00:00+07:00`);
  return [awal, new Date(awal.getTime() + 86_400_000)];
}
export const tanggalSah = (s: string | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00+07:00`).getTime());
export function geserHari(tgl: string, n: number) {
  return tanggalWib(new Date(rentangHari(tgl)[0].getTime() + n * 86_400_000));
}

/** PSN-YYMM menurut bulan pengiriman (WIB). */
export const awalanKode = (kirim: Date) => `PSN-${tanggalWib(kirim).slice(2, 4)}${tanggalWib(kirim).slice(5, 7)}`;

/** Jumlah porsi tiap komponen menu, dari komposisi yang dipisah koma. Terbanyak lebih dulu. */
export function rekapKomponen(baris: { komposisi: string; jumlah: number }[]): [string, number][] {
  const m = new Map<string, number>();
  for (const b of baris) {
    for (const k of b.komposisi.split(",")) {
      const nama = k.trim().toLowerCase();
      if (nama) m.set(nama, (m.get(nama) ?? 0) + b.jumlah);
    }
  }
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Sel CSV: dikutip, dan diberi awalan apostrof jika bisa ditafsirkan sebagai rumus oleh aplikasi spreadsheet. */
export function selCsv(v: string | number) {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Hanya path internal yang boleh jadi tujuan redirect. */
export const pathAman = (p: unknown, cadangan: string) =>
  typeof p === "string" && /^\/(?![/\\])[\w\-/?=&.%]*$/.test(p) ? p : cadangan;

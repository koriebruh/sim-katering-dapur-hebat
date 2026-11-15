import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Judul, kelas } from "@/components/ui";
import { db } from "@/db";
import { menu, pelanggan } from "@/db/schema";
import { wajibLogin } from "@/lib/dal";
import { tanggalWib } from "@/lib/pesanan";
import { FormPesanan } from "./form-pesanan";

export const metadata: Metadata = { title: "Pesanan Baru" };

export default async function PesananBaru() {
  await wajibLogin(["admin"]);
  const [daftarPelanggan, daftarMenu] = await Promise.all([
    db.select({ id: pelanggan.id, nama: pelanggan.nama, alamat: pelanggan.alamat }).from(pelanggan).orderBy(asc(pelanggan.nama)),
    db.select({ id: menu.id, nama: menu.nama, harga: menu.harga }).from(menu).where(eq(menu.aktif, true)).orderBy(asc(menu.id)),
  ]);
  return (
    <>
      <Judul judul="Pesanan baru" sub="Total dan sisa tagihan dihitung otomatis">
        <Link href="/pesanan" className={kelas.tombolGaris}><ArrowLeft size={16} aria-hidden /> Daftar pesanan</Link>
      </Judul>
      <FormPesanan pelanggan={daftarPelanggan} menu={daftarMenu} hariIni={tanggalWib()} />
    </>
  );
}

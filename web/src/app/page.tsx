import { asc, eq } from "drizzle-orm";
import { Clock, MapPin, MessageCircle, Truck, UtensilsCrossed, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { menu } from "@/db/schema";
import { rupiah } from "@/lib/format";
import { SITUS, tautanWa } from "@/lib/situs";
import { KotakHero } from "./kotak-hero";

// Dibangun statis, diperbarui paling lama 5 menit setelah menu diubah.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "id_ID", url: "/", siteName: SITUS.nama,
    title: "Katering Dapur Hebat — Nasi Box & Tumpeng Pamulang", description: SITUS.deskripsi,
    images: [{ url: "/menu/paket-hebat-3.jpg", width: 1280, height: 714, alt: "Paket Hebat 3 dari Katering Dapur Hebat" }],
  },
};

const LANGKAH = [
  [UtensilsCrossed, "Pilih menu dan jumlah porsi", `Minimal ${SITUS.minimalPorsi} porsi per pesanan. Menu boleh dicampur.`],
  [MessageCircle, "Kirim pesanan lewat WhatsApp", "Sebutkan tanggal, jam, dan alamat pengiriman. Kami balas dengan total harga."],
  [Wallet, "Bayar uang muka 50%", "Pesanan masuk jadwal dapur setelah uang muka kami terima."],
  [Truck, "Pesanan diantar", "Dimasak pagi di hari acara dan diantar sebelum acara dimulai. Sisanya dibayar saat pesanan tiba."],
] as const;

// Susunan sekat baki: satu sekat besar, empat kecil, dua memanjang.
const SEKAT = ["sm:col-span-2 lg:row-span-2", "", "", "", "", "sm:col-span-2", "sm:col-span-2"];

export default async function Beranda() {
  const daftar = await db
    .select({ nama: menu.nama, slug: menu.slug, komposisi: menu.komposisi, harga: menu.harga, foto: menu.foto })
    .from(menu).where(eq(menu.aktif, true)).orderBy(asc(menu.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: SITUS.nama, url: SITUS.url, description: SITUS.deskripsi, telephone: `+${SITUS.wa}`,
    image: `${SITUS.url}/menu/paket-hebat-3.jpg`, servesCuisine: "Indonesia", priceRange: "Rp",
    address: {
      "@type": "PostalAddress", streetAddress: SITUS.alamat.jalan, addressLocality: SITUS.alamat.kota,
      addressRegion: SITUS.alamat.provinsi, postalCode: SITUS.alamat.kodePos, addressCountry: "ID",
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuItem: daftar.map((m) => ({
        "@type": "MenuItem", name: m.nama, description: m.komposisi,
        offers: { "@type": "Offer", price: m.harga, priceCurrency: "IDR" },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a href="#menu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Langsung ke menu
      </a>

      <header className="bg-brand-800 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-lg font-extrabold">Dapur Hebat</Link>
          <nav aria-label="Navigasi halaman" className="flex items-center gap-5 text-sm">
            <a href="#menu" className="hidden hover:underline sm:inline">Menu</a>
            <a href="#cara-pesan" className="hidden hover:underline sm:inline">Cara pesan</a>
            <a href="#kontak" className="hidden hover:underline sm:inline">Kontak</a>
            <Link href="/login" className="rounded-md border border-white/40 px-3 py-1.5 hover:bg-white/10">Masuk karyawan</Link>
          </nav>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_1.05fr] lg:pb-20">
          <div>
            <h1 className="max-w-[16ch] text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              Nasi box dan tumpeng, dimasak pagi di hari acara Anda.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg text-brand-100">
              Masakan rumahan untuk rapat kantor, acara sekolah, arisan, dan syukuran di Pamulang dan sekitarnya.
              Mulai {rupiah(Math.min(...daftar.map((m) => m.harga)))} per porsi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={tautanWa()} className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-600">
                <MessageCircle size={18} aria-hidden /> Pesan lewat WhatsApp
              </a>
              <a href="#menu" className="rounded-lg border border-white/40 px-5 py-3 font-semibold transition hover:bg-white/10">Lihat menu</a>
            </div>
          </div>
          <KotakHero foto="/menu/paket-hebat-3.jpg" alt="Paket Hebat 3: nasi putih, ayam teriyaki, tumis buncis jagung, tempe orek, mie goreng, dan sambal dalam kotak kraft" />
        </div>
      </header>

      <main>
        <section id="menu" aria-labelledby="judul-menu" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-16">
          <h2 id="judul-menu" className="text-3xl font-extrabold text-ink">Tujuh pilihan menu</h2>
          <p className="mt-2 max-w-[60ch] text-muted">
            Setiap porsi datang dalam kotak kraft bersekat, lengkap dengan sendok dan tisu. Harga per porsi, sudah termasuk kemasan.
          </p>
          <ul className="mt-8 grid gap-3 rounded-2xl bg-kraft-500 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {daftar.map((m, i) => (
              <li key={m.slug} className={`flex flex-col overflow-hidden rounded-lg bg-rice ${SEKAT[i] ?? ""}`}>
                <div className={`relative ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:flex-1" : "aspect-[16/10]"}`}>
                  {m.foto && (
                    <Image src={m.foto} alt={`${m.nama}: ${m.komposisi.toLowerCase()}`} fill className="object-cover"
                      sizes={i === 0 ? "(min-width: 1024px) 560px, 92vw" : "(min-width: 1024px) 280px, (min-width: 640px) 46vw, 92vw"} />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className={`font-bold text-ink ${i === 0 ? "text-xl" : ""}`}>{m.nama}</h3>
                    <p className="shrink-0 font-bold text-accent-600">{rupiah(m.harga)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{m.komposisi}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="cara-pesan" aria-labelledby="judul-cara" className="scroll-mt-6 bg-kraft-100">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 id="judul-cara" className="text-3xl font-extrabold text-ink">Cara pesan</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {LANGKAH.map(([Ikon, judul, isi], i) => (
                <li key={judul}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-brand-800 text-white"><Ikon size={18} aria-hidden /></span>
                    <span className="text-sm font-bold text-kraft-700">Langkah {i + 1}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-ink">{judul}</h3>
                  <p className="mt-1 text-sm text-muted">{isi}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="kontak" aria-labelledby="judul-kontak" className="mx-auto grid max-w-6xl scroll-mt-6 gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <h2 id="judul-kontak" className="text-3xl font-extrabold text-ink">Pesan untuk acara Anda</h2>
            <p className="mt-2 max-w-[50ch] text-muted">
              Kabari kami paling lambat tiga hari sebelum acara supaya bahan bisa kami siapkan.
            </p>
            <a href={tautanWa()} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-600">
              <MessageCircle size={18} aria-hidden /> Pesan lewat WhatsApp
            </a>
          </div>
          <address className="grid content-start gap-4 not-italic text-ink">
            <p className="flex gap-3"><MapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-brand-800" />
              <span>{SITUS.alamat.jalan}<br />{SITUS.alamat.kota}, {SITUS.alamat.provinsi} {SITUS.alamat.kodePos}</span></p>
            <p className="flex gap-3"><Clock size={20} aria-hidden className="shrink-0 text-brand-800" /> {SITUS.jam}</p>
          </address>
        </section>
      </main>

      <footer className="bg-brand-900 px-5 py-6 text-center text-sm text-brand-100">
        © {new Date().getFullYear()} {SITUS.nama}
      </footer>
    </>
  );
}

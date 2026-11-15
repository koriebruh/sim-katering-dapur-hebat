import { asc, eq } from "drizzle-orm";
import { Clock, MapPin, MessageCircle, Truck, UtensilsCrossed, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gelombang, Logo, Noda } from "@/components/ilustrasi";
import { Muncul } from "@/components/klien";
import { kelas } from "@/components/ui";
import { db } from "@/db";
import { menu } from "@/db/schema";
import { rupiah } from "@/lib/format";
import { SITUS, tautanWa } from "@/lib/situs";
import { FotoHero } from "./kotak-hero";

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

export default async function Beranda() {
  const daftar = await db
    .select({ nama: menu.nama, slug: menu.slug, komposisi: menu.komposisi, harga: menu.harga, foto: menu.foto })
    .from(menu).where(eq(menu.aktif, true)).orderBy(asc(menu.id));
  const termurah = daftar.length ? Math.min(...daftar.map((m) => m.harga)) : 0;

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
    <div className="relative overflow-hidden">
      {/* JSON-LD: tanda < di-escape agar isi menu tidak bisa menutup tag script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a href="#menu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Langsung ke menu
      </a>
      <Noda className="-right-56 -top-56 w-[720px]" />
      <Noda className="-left-72 top-[640px] w-[640px]" />

      <header className="relative mx-auto flex max-w-[1840px] items-center justify-between gap-4 px-5 py-5 sm:px-8 xl:px-14">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold text-ink"><Logo /> Dapur Hebat</Link>
        <nav aria-label="Navigasi halaman" className="flex items-center gap-1 text-sm">
          {[["#menu", "Menu"], ["#cara-pesan", "Cara pesan"], ["#kontak", "Kontak"]].map(([href, label]) => (
            <a key={href} href={href} className="hidden rounded-xl px-3.5 py-2 text-muted transition hover:bg-white hover:text-ink sm:inline">{label}</a>
          ))}
          <Link href="/login" className={`${kelas.tombolGaris} ml-2`}>Masuk karyawan</Link>
        </nav>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-[1840px] px-5 sm:px-8 xl:px-14 pb-6 pt-2">
          <div className="grid items-center gap-8 rounded-[2rem] bg-gradient-to-br from-accent-100 via-white to-white p-7 ring-1 ring-line sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14 2xl:px-24 2xl:py-20">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem] 2xl:text-[4.4rem]">
                Nasi box hangat,<br /><span className="text-accent-500">diantar tepat waktu</span>
              </h1>
              <Gelombang className="mt-3 w-44" />
              <p className="mt-5 max-w-[46ch] text-lg text-muted 2xl:text-xl">
                Masakan rumahan untuk rapat kantor, acara sekolah, arisan, dan syukuran di Pamulang dan sekitarnya. Dimasak pagi di hari acara Anda.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={tautanWa()} target="_blank" rel="noopener noreferrer" className={`${kelas.tombol} !px-6 !py-3.5 !text-base`}><MessageCircle size={19} aria-hidden /> Pesan lewat WhatsApp</a>
                <a href="#menu" className={`${kelas.tombolGaris} !px-6 !py-3.5 !text-base`}>Lihat menu</a>
              </div>
            </div>
            <FotoHero
              foto="/menu/paket-hebat-3.jpg" harga={rupiah(termurah)} minimal={SITUS.minimalPorsi}
              alt="Paket Hebat 3: nasi putih, ayam teriyaki, tumis buncis jagung, tempe orek, mie goreng, dan sambal"
            />
          </div>
        </section>

        <section id="menu" aria-labelledby="judul-menu" className="mx-auto max-w-[1840px] scroll-mt-6 px-5 sm:px-8 xl:px-14 py-14">
          <h2 id="judul-menu" className="text-3xl font-extrabold tracking-tight text-ink">Pilihan menu</h2>
          <p className="mt-2 max-w-[60ch] text-muted">
            Setiap porsi datang dalam kotak bersekat, lengkap dengan sendok dan tisu. Harga per porsi sudah termasuk kemasan.
          </p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-7">
            {daftar.map((m, i) => (
              <li key={m.slug}>
                <Muncul urut={i % 4} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgb(28_25_23/0.06)] ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-500/10">
                  <div className="relative aspect-[4/3] overflow-hidden bg-accent-100">
                    {m.foto && (
                      <Image src={m.foto} alt={`${m.nama}: ${m.komposisi.toLowerCase()}`} fill className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 270px, (min-width: 640px) 46vw, 92vw" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-ink">{m.nama}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted">{m.komposisi}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-lg font-extrabold text-accent-600">{rupiah(m.harga)} <span className="text-xs font-medium text-muted">per porsi</span></p>
                      <a href={tautanWa(m)} target="_blank" rel="noopener noreferrer" aria-label={`Pesan ${m.nama} lewat WhatsApp`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-100 px-3 py-2 text-sm font-semibold text-accent-600 transition hover:bg-accent-500 hover:text-white active:scale-[0.97]">
                        <MessageCircle size={15} aria-hidden /> Pesan
                      </a>
                    </div>
                  </div>
                </Muncul>
              </li>
            ))}
          </ul>
        </section>

        <section id="cara-pesan" aria-labelledby="judul-cara" className="mx-auto max-w-[1840px] scroll-mt-6 px-5 sm:px-8 xl:px-14 py-14">
          <h2 id="judul-cara" className="text-3xl font-extrabold tracking-tight text-ink">Cara pesan</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH.map(([Ikon, judul, isi], i) => (
              <li key={judul}>
                <Muncul urut={i} className="h-full rounded-2xl bg-white p-5 ring-1 ring-line">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-accent-100 text-accent-600"><Ikon size={20} aria-hidden /></span>
                    <span className="text-3xl font-extrabold text-accent-500/25" aria-hidden>{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-bold text-ink"><span className="sr-only">Langkah {i + 1}: </span>{judul}</h3>
                  <p className="mt-1 text-sm text-muted">{isi}</p>
                </Muncul>
              </li>
            ))}
          </ol>
        </section>

        <section id="kontak" aria-labelledby="judul-kontak" className="mx-auto max-w-[1840px] scroll-mt-6 px-5 sm:px-8 xl:px-14 pb-16 pt-6">
          <div className="grid gap-8 rounded-[2rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <h2 id="judul-kontak" className="text-3xl font-extrabold tracking-tight">Pesan untuk acara Anda</h2>
              <p className="mt-2 max-w-[50ch] text-white/70">Kabari kami paling lambat tiga hari sebelum acara supaya bahan bisa kami siapkan.</p>
              <a href={tautanWa()} target="_blank" rel="noopener noreferrer" className={`${kelas.tombol} mt-6 !px-6 !py-3.5 !text-base`}><MessageCircle size={19} aria-hidden /> Pesan lewat WhatsApp</a>
            </div>
            <address className="grid content-start gap-4 not-italic text-white/85">
              <p className="flex gap-3"><MapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-accent-500" />
                <span>{SITUS.alamat.jalan}<br />{SITUS.alamat.kota}, {SITUS.alamat.provinsi} {SITUS.alamat.kodePos}</span></p>
              <p className="flex gap-3"><Clock size={20} aria-hidden className="shrink-0 text-accent-500" /> {SITUS.jam}</p>
              <p className="flex gap-3"><MessageCircle size={20} aria-hidden className="shrink-0 text-accent-500" />
                <a href={tautanWa()} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">WhatsApp {SITUS.waTampil}</a></p>
            </address>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-line px-5 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} {SITUS.nama}
      </footer>
    </div>
  );
}

// Identitas usaha untuk halaman publik dan SEO. Alamat, jam, dan nomor WhatsApp masih DUMMY.
export const SITUS = {
  nama: "Katering Dapur Hebat",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  deskripsi:
    "Katering nasi box, paket nasi, dan tumpeng mini untuk acara kantor, sekolah, dan keluarga di Pamulang, Tangerang Selatan.",
  alamat: {
    jalan: "Jl. Raya Siliwangi No. 45, Pamulang Barat",
    kota: "Tangerang Selatan",
    provinsi: "Banten",
    kodePos: "15417",
  },
  jam: "Setiap hari, 07.00–20.00 WIB",
  wa: "6281200000000",
  minimalPorsi: 25,
} as const;

export const tautanWa = (pesan = "Halo Dapur Hebat, saya ingin memesan katering.") =>
  `https://wa.me/${SITUS.wa}?text=${encodeURIComponent(pesan)}`;

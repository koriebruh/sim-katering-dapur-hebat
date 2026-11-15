// Identitas usaha untuk halaman publik dan SEO. Alamat dan jam masih DUMMY; nomor WhatsApp asli.
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
  wa: "62895411763888",
  waTampil: "0895-4117-63888",
  minimalPorsi: 25,
} as const;

const FORMULIR = "\nJumlah porsi: \nTanggal dan jam kirim: \nAlamat kirim: \nNama pemesan: ";

/** Tautan WhatsApp dengan pesan pemesanan yang sudah terisi; pelanggan tinggal melengkapi. */
export const tautanWa = (menu?: { nama: string; harga: number }) =>
  `https://wa.me/${SITUS.wa}?text=${encodeURIComponent(
    (menu
      ? `Halo Dapur Hebat, saya ingin memesan ${menu.nama} (Rp${menu.harga.toLocaleString("id-ID")} per porsi).`
      : "Halo Dapur Hebat, saya ingin memesan katering.\nMenu: ") + FORMULIR,
  )}`;

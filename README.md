# SIM Katering Dapur Hebat

Proyek mata kuliah Sistem Informasi Manajemen (Teknik Informatika, Universitas Pamulang, 2026): laporan perancangan SIM dengan metode SDLC, ditambah purwarupa aplikasi web yang dibangun mengikuti rancangan itu.

- Aplikasi: https://sim-katering-dapur-hebat.vercel.app
- Laporan: `Laporan-SIM-Katering-Dapur-Hebat.docx` (32 halaman; tidak ikut di repo karena memuat nama dan NIM)

## Status

| Bagian | Status |
|---|---|
| Laporan 6 bab + daftar pustaka + lampiran | Draf lengkap, **data usaha masih dummy** |
| 4 diagram (flowchart, DFD konteks, DFD level 1, ERD) | Selesai, `.drawio` + `.png` |
| 7 gambar antarmuka di laporan | Tangkapan layar aplikasi asli |
| Aplikasi F-01 sampai F-11 | Selesai dan online |
| Mockup di Canva (diminta template) | **Belum**: unggah `mockup/papan-mockup.png` atau ketujuh PNG ke Canva, isi link di Lampiran |
| Papan mockup di FigCraft | Selesai: `mockup/mockup-sim-katering.figcraft` dan `mockup/papan-mockup.png` (7 layar aplikasi disusun berjudul) |
| Bahan presentasi | Draf 12 slide: `Presentasi-SIM-Katering-Dapur-Hebat.pptx` dan `.pdf` (tidak ikut di repo) |
| Presentasi (P13) dan revisi (P14) | Belum |

## Aplikasi

| Peran | Akun demo | Yang bisa dilakukan |
|---|---|---|
| Admin Pemesanan | `admin.rina` | Kelola menu dan pelanggan, catat pesanan, catat uang muka/pelunasan, ubah status, cari pesanan |
| Kepala Dapur | `dapur.sari` | Lihat jadwal produksi dan rekap komponen menu, tandai dikirim/selesai |
| Manajer Operasional | `manajer.budi` | Lihat pesanan (nomor HP tersamar), laporan penjualan dan piutang, ekspor CSV, cetak |
| Pemilik | `pemilik.nur` | Dashboard omzet, tren 6 bulan, menu terlaris, piutang |
| Pengunjung | tanpa login | Halaman publik: profil, katalog menu, pesan lewat WhatsApp |

Kata sandi akun demo disimpan di Vercel (variabel `SEED_PASSWORD`) dan di `web/.env.local` untuk lokal; tidak ditulis di repo.

Teknologi: Next.js 16 (App Router), PostgreSQL (Neon lewat Vercel) + Drizzle, Tailwind CSS v4, Motion, Lucide. Rencana dan keputusan ada di [`docs/PROJECT.md`](docs/PROJECT.md) dan [`docs/features/M0-kerangka.md`](docs/features/M0-kerangka.md).

### Menjalankan di lokal

```
cd web
cp .env.example .env.local      # isi SESSION_SECRET dan SEED_PASSWORD
npm install
npm run db:up && npm run db:migrate && npm run db:seed
npm run dev
```

`npm test` menjalankan 23 unit test aturan bisnis dan `npm run test:e2e` menjalankan uji alur di browser (butuh database lokal yang sudah di-seed); `npm run build` dan `npm run lint` harus lulus sebelum deploy. Deploy: `vercel deploy --prod` dari folder `web/` (migrasi database berjalan otomatis saat build).

### Keamanan yang diterapkan

- Kata sandi di-hash dengan bcrypt; cookie sesi `httpOnly`, `secure`, bertanda tangan, berlaku 8 jam.
- Hak akses diperiksa di server pada setiap halaman dan aksi; peran dibaca ulang dari database tiap permintaan.
- Login dibatasi: 5 gagal per akun + IP, 20 per IP, 20 per akun dalam 15 menit.
- Nomor HP pelanggan tersamar untuk selain admin dan tidak tampil di jadwal dapur.
- Semua masukan divalidasi di server; total, uang muka, dan sisa dihitung server di dalam transaksi database.
- Setiap perubahan pesanan, pembayaran, menu, dan pelanggan tercatat di `audit_log`.
- Header keamanan, halaman internal `noindex`, sel CSV dinetralkan dari rumus.

Satu kompromi yang disengaja: seseorang masih bisa mengunci satu akun selama 15 menit dengan 20 kali salah login. Mencegahnya sepenuhnya butuh CAPTCHA.

### Hasil uji terakhir

| Uji | Hasil |
|---|---|
| Unit test (`npm test`) | 23 lulus |
| Uji alur otomatis (`npm run test:e2e`), TC-01 sampai TC-15 + tampilan ponsel 390 px | 12 uji lulus, termasuk validasi server, penolakan akses per peran, dan pemalsuan status |
| Uji cepat di situs online | 13 pemeriksaan lulus |

Uji alur ada di `web/e2e/alur.e2e.ts` (Playwright, memakai Chrome yang terpasang). Uji ini menulis data contoh ke database lokal, jadi jangan diarahkan ke database produksi.

## Data dummy yang harus diganti

Template laporan meminta fakta hasil observasi/wawancara. Yang berikut ini karangan dan wajib diganti sebelum laporan dikumpulkan:

| Data | Nilai dummy | Lokasi |
|---|---|---|
| Kelas | 05TPLE004 | Cover laporan |
| Nama usaha | Katering Dapur Hebat | Laporan, aplikasi |
| Alamat, jam buka, nomor WhatsApp, minimal 25 porsi | Lihat `web/src/lib/situs.ts` | Laporan 1.2, halaman publik |
| Karyawan dan struktur | 8 orang | Laporan 1.1, 1.2 |
| Narasumber dan nama pengguna | Ibu Hj. Nurhayati, Rina Oktaviani, Budi Santoso, Ibu Sari | Laporan, akun demo |
| Tanggal wawancara/observasi | 7 dan 8 November 2026 | Laporan 2.1 |
| Alur kerja dan 5 masalah | Disusun dari pola umum katering kecil dan dua jurnal, bukan wawancara | Laporan 1.1, 2.2, 2.3 |
| Harga menu | Rp22.000–Rp35.000 | Laporan, aplikasi |
| Angka kelayakan, jadwal P9–P14 | — | Laporan 1.6, 1.7 |
| Pelanggan dan pesanan | Data contoh hasil seed | Aplikasi |

Bukan dummy: nama dan NIM penulis, 7 menu beserta komposisinya (`asset/info.txt`), foto menu, dan 19 sumber daftar pustaka. Dari 12 jurnal yang diberikan, 8 metadatanya sudah dicocokkan ke halaman jurnal; isi yang dikutip hanya dari abstrak yang terbaca.

Catatan menu, `info.txt` dibanding foto: ayam serundeng dan Paket Hebat 2 ada sambal di foto tetapi tidak di daftar; cumi cabe ijo tertulis mie goreng tetapi di foto tampak soun/bihun; Tumpeng Mini memakai nasi kuning yang tidak tertulis.

## Yang masih harus dikerjakan

- [ ] Ganti data dummy dengan data asli katering (laporan: `build_laporan.py`; aplikasi: `web/src/lib/situs.ts` dan halaman Menu/Pelanggan)
- [ ] Unggah gambar di `mockup/` ke Canva, isi link Canva di Lampiran
- [ ] Logo Universitas Pamulang di cover (tidak ditemukan sumber resmi yang bisa diunduh otomatis)
- [ ] Bukti observasi/wawancara di Lampiran
- [ ] Cek nomor halaman daftar isi di Word. Daftar isi sudah terisi otomatis dari hasil render LibreOffice; bila Word memecah halaman sedikit berbeda, klik kanan daftar isi → Update Field
- [ ] Sesuaikan slide presentasi dengan data asli dan arahan dosen; presentasi P13, lalu revisi P14 dan Tabel Catatan Revisi

## Isi folder

| Path | Isi |
|---|---|
| `web/` | Aplikasi |
| `docs/` | Rencana proyek dan keputusan |
| `diagram/` | 4 diagram, `.drawio` + `.png` |
| `mockup/` | 7 tangkapan layar aplikasi yang dipakai laporan, papan mockup FigCraft (file `.html` adalah mockup awal) |
| `asset/` | Foto menu dan `info.txt` |
| `build_gambar.py` | Membuat ulang diagram |
| `build_laporan.py` | Membuat ulang laporan dari template (tidak ikut di repo) |

Mengedit laporan langsung di Word boleh, tetapi jangan jalankan `build_laporan.py` setelahnya karena skrip itu menimpa file laporan.

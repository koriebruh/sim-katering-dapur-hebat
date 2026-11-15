# SIM Katering Dapur Hebat

Proyek mata kuliah Sistem Informasi Manajemen (Teknik Informatika, Universitas Pamulang, 2026): laporan perancangan SIM dengan metode SDLC, ditambah purwarupa aplikasi web yang dibangun mengikuti rancangan itu.

- Aplikasi: https://sim-katering-dapur-hebat.vercel.app
- Laporan: [`Laporan-SIM-Katering-Dapur-Hebat.pdf`](Laporan-SIM-Katering-Dapur-Hebat.pdf) (33 halaman)
- Presentasi: [`Presentasi-SIM-Katering-Dapur-Hebat.pptx`](Presentasi-SIM-Katering-Dapur-Hebat.pptx) (14 slide)
- Penulis: Syahwa Rahma Andini, NIM 241011402529

## Status

| Bagian | Status |
|---|---|
| Laporan 6 bab + daftar pustaka + lampiran | Lengkap dengan logo, daftar isi, dan ringkasan wawancara; data usaha karangan (diizinkan dosen), **kelas di cover masih dummy** |
| 4 diagram (flowchart, DFD konteks, DFD level 1, ERD) | Selesai, `.drawio` + `.png` |
| 7 gambar antarmuka di laporan | Tangkapan layar aplikasi asli |
| Aplikasi F-01 sampai F-11 | Selesai dan online |
| Mockup di Canva (diminta template) | **Belum**: unggah `mockup/papan-mockup.png` atau ketujuh PNG ke Canva, isi link di Lampiran |
| Papan mockup di FigCraft | Selesai: `mockup/mockup-sim-katering.figcraft` dan `mockup/papan-mockup.png` (7 layar aplikasi disusun berjudul) |
| Bahan presentasi | 14 slide, `.pptx` dan `.pdf` |
| Presentasi (P13) dan revisi (P14) | Belum |

## Dokumen

| File | Isi |
|---|---|
| [`Laporan-SIM-Katering-Dapur-Hebat.pdf`](Laporan-SIM-Katering-Dapur-Hebat.pdf) | Laporan proyek, 33 halaman: 6 bab, daftar pustaka (19 sumber), lampiran |
| [`Presentasi-SIM-Katering-Dapur-Hebat.pptx`](Presentasi-SIM-Katering-Dapur-Hebat.pptx) | Bahan presentasi, 14 slide, dapat diedit di PowerPoint |
| [`Presentasi-SIM-Katering-Dapur-Hebat.pdf`](Presentasi-SIM-Katering-Dapur-Hebat.pdf) | Bahan presentasi versi PDF |
| [`mockup/papan-mockup.png`](mockup/papan-mockup.png) | Papan mockup tujuh layar (sumber: `mockup/mockup-sim-katering.figcraft`) |
| `diagram/` | Flowchart sistem berjalan, DFD konteks, DFD level 1, ERD (`.drawio` + `.png`) |

Versi Word laporan (`.docx`), template dosen, logo, dan skrip pembuat laporan tidak ikut di repo.

## Aplikasi

Alamat: https://sim-katering-dapur-hebat.vercel.app

Halaman login: https://sim-katering-dapur-hebat.vercel.app/login

### Akun demo

Kata sandi keempat akun sama: **`Dapur-59f00acd63`**

| Peran | Nama pengguna | Nama di aplikasi | Halaman yang bisa dibuka | Yang bisa dilakukan |
|---|---|---|---|---|
| Admin Pemesanan | `admin.rina` | Rina Oktaviani | Dashboard, Pesanan, Jadwal Produksi, Menu & Paket, Pelanggan | Kelola menu dan pelanggan, catat pesanan, catat uang muka/pelunasan, ubah status, batalkan pesanan, cari pesanan |
| Kepala Dapur | `dapur.sari` | Ibu Sari | Dashboard, Jadwal Produksi | Lihat jadwal produksi dan rekap komponen menu, tandai dikirim/selesai |
| Manajer Operasional | `manajer.budi` | Budi Santoso | Dashboard, Pesanan, Laporan | Lihat pesanan (nomor HP tersamar), laporan penjualan dan piutang, ekspor CSV, cetak |
| Pemilik | `pemilik.nur` | Hj. Nurhayati | Dashboard, Laporan | Dashboard omzet, tren 6 bulan, menu terlaris, piutang |
| Pengunjung | tanpa login | — | Halaman publik | Lihat profil dan katalog menu, pesan lewat WhatsApp |

Login memakai nama pengguna, bukan email. Akun ini hanya untuk demo dan seluruh datanya contoh. Karena kata sandinya tertulis di repo publik, siapa pun bisa masuk dan mengubah data demo; jangan pakai akun atau kata sandi ini untuk data sungguhan. Setelah 5 kali salah sandi, login akun itu ditahan 15 menit.

Untuk lokal, kata sandi akun mengikuti `SEED_PASSWORD` di `web/.env.local` saat `npm run db:seed` dijalankan.

### Alur yang bisa dicoba

1. Masuk sebagai `admin.rina`, buka **Pesanan → Pesanan baru**, pilih pelanggan dan menu, klik **50%** untuk uang muka, simpan.
2. Masuk sebagai `dapur.sari`, buka **Jadwal Produksi** pada tanggal kirim pesanan tadi, klik **Kirim** lalu **Selesai**.
3. Masuk sebagai `admin.rina` lagi, buka pesanan itu, catat pelunasan.
4. Masuk sebagai `manajer.budi`, buka **Laporan**, coba **Ekspor CSV**.
5. Masuk sebagai `pemilik.nur` untuk melihat dashboard ringkasan usaha.

### Halaman

| Alamat | Isi | Peran |
|---|---|---|
| `/` | Halaman publik: profil, katalog menu, cara pesan, kontak | Semua orang |
| `/login` | Masuk | Karyawan |
| `/dashboard` | Ringkasan sesuai peran | Semua peran |
| `/pesanan`, `/pesanan/baru`, `/pesanan/[kode]` | Daftar dan pencarian, pesanan baru, detail dan pembayaran | Admin; manajer hanya melihat |
| `/jadwal` | Jadwal produksi per tanggal dan rekap komponen | Kepala dapur, admin |
| `/menu-paket` | Kelola menu dan harga | Admin |
| `/pelanggan` | Kelola pelanggan | Admin |
| `/laporan`, `/laporan/ekspor` | Laporan penjualan dan piutang, ekspor CSV | Manajer, pemilik |

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

Menurut dosen, data wawancara tidak wajib asli dan boleh dikarang. Yang berikut ini karangan; ganti bila data asli katering tersedia:

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

- [ ] Opsional: ganti data dummy dengan data asli katering (laporan: `build_laporan.py`; aplikasi: `web/src/lib/situs.ts` dan halaman Menu/Pelanggan). Kelas di cover (05TPLE004) tetap perlu diganti
- [ ] Unggah gambar di `mockup/` ke Canva, isi link Canva di Lampiran
- [x] Logo Universitas Pamulang di cover dan slide judul (`UNPAM_logo1.png`, tidak ikut di repo)
- [x] Ringkasan wawancara di Lampiran (karangan, sesuai izin dosen)
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
| `build_laporan.py` | Membuat ulang laporan `.docx` dari template (tidak ikut di repo) |
| `Laporan-*.pdf`, `Presentasi-*` | Laporan dan bahan presentasi |

Mengedit laporan langsung di Word boleh, tetapi jangan jalankan `build_laporan.py` setelahnya karena skrip itu menimpa file laporan.

# SIM Katering Dapur Hebat

Proyek mata kuliah Sistem Informasi Manajemen, Program Studi Teknik Informatika, Universitas Pamulang, 2026: laporan perancangan SIM dengan metode SDLC, bahan presentasi, dan purwarupa aplikasi web yang dibangun mengikuti rancangan itu.

| | |
|---|---|
| Penulis | Syahwa Rahma Andini, NIM 241011402529, kelas 05TPLP012 |
| Aplikasi | https://sim-katering-dapur-hebat.vercel.app |
| Laporan | [`Laporan-SIM-Katering-Dapur-Hebat.pdf`](Laporan-SIM-Katering-Dapur-Hebat.pdf), 33 halaman |
| Presentasi | [`Presentasi-SIM-Katering-Dapur-Hebat.pptx`](Presentasi-SIM-Katering-Dapur-Hebat.pptx) dan [`.pdf`](Presentasi-SIM-Katering-Dapur-Hebat.pdf), 17 slide |
| Mockup di Canva | https://canva.link/f2uukvtx89xu4l5 |

## Status

| Bagian | Status |
|---|---|
| Laporan: 6 bab, daftar pustaka 19 sumber, lampiran, logo, daftar isi | Selesai |
| Diagram: flowchart sistem berjalan, DFD konteks, DFD level 1, ERD | Selesai |
| Mockup tujuh layar: papan FigCraft dan Canva | Selesai |
| Aplikasi F-01 sampai F-11 | Selesai dan online |
| Uji: 23 unit test, 12 uji alur otomatis | Lulus |
| Bahan presentasi 17 slide | Selesai |

Agenda berikutnya, bukan pekerjaan yang tertinggal: presentasi di P13, lalu revisi di P14 dan pengisian Tabel Catatan Revisi di Lampiran laporan.

## Dokumen

| File | Isi |
|---|---|
| [`Laporan-SIM-Katering-Dapur-Hebat.pdf`](Laporan-SIM-Katering-Dapur-Hebat.pdf) | Laporan proyek |
| [`Presentasi-SIM-Katering-Dapur-Hebat.pptx`](Presentasi-SIM-Katering-Dapur-Hebat.pptx) | Bahan presentasi dengan catatan pembicara, dapat diedit di PowerPoint |
| [`Presentasi-SIM-Katering-Dapur-Hebat.pdf`](Presentasi-SIM-Katering-Dapur-Hebat.pdf) | Bahan presentasi versi PDF |
| [`mockup/papan-mockup.png`](mockup/papan-mockup.png) | Papan mockup tujuh layar; sumbernya `mockup/mockup-sim-katering.figcraft` |
| `diagram/` | Empat diagram, masing-masing `.drawio` dan `.png` |
| `fonts/` | Huruf Plus Jakarta Sans (lisensi OFL) |

Dua catatan pemakaian:

- File presentasi `.pptx` memakai huruf Plus Jakarta Sans, sama dengan aplikasi. Di komputer yang belum memilikinya, pasang dulu file di `fonts/`; tanpa itu PowerPoint mengganti hurufnya dan tata letak bisa bergeser. Versi PDF tidak terpengaruh.
- Versi Word laporan, template dosen, logo, dan skrip pembuat laporan tidak ikut di repo. Jika versi Word diedit, klik kanan daftar isi lalu pilih Update Field agar nomor halamannya mengikuti.

## Aplikasi

- Alamat: https://sim-katering-dapur-hebat.vercel.app
- Login karyawan: https://sim-katering-dapur-hebat.vercel.app/login

### Akun demo

Login memakai nama pengguna, bukan email.

| Peran | Nama pengguna | Kata sandi | Nama di aplikasi | Menu yang tersedia |
|---|---|---|---|---|
| Admin Pemesanan | `admin.rina` | `Dapur-59f00acd63` | Rina Oktaviani | Dashboard, Pesanan, Jadwal Produksi, Menu & Paket, Pelanggan |
| Kepala Dapur | `dapur.sari` | `Dapur-59f00acd63` | Ibu Sari | Dashboard, Jadwal Produksi |
| Manajer Operasional | `manajer.budi` | `Dapur-59f00acd63` | Budi Santoso | Dashboard, Pesanan, Laporan |
| Pemilik | `pemilik.nur` | `Dapur-59f00acd63` | Hj. Nurhayati | Dashboard, Laporan |

Pengunjung tidak perlu login: halaman depan menampilkan profil, katalog menu, dan tombol pesan lewat WhatsApp ke 0895-4117-63888 dengan pesan pemesanan yang sudah terisi.

Akun ini hanya untuk demo dan seluruh datanya contoh. Karena kata sandinya tertulis di repo publik, siapa pun bisa masuk dan mengubah data demo; jangan pakai akun atau kata sandi ini untuk data sungguhan. Setelah 5 kali salah sandi, login akun itu ditahan 15 menit.

### Yang bisa dilakukan tiap peran

| Peran | Kemampuan |
|---|---|
| Admin Pemesanan | Kelola menu dan pelanggan, catat pesanan, catat uang muka dan pelunasan, ubah status, batalkan pesanan, cari pesanan |
| Kepala Dapur | Lihat jadwal produksi per tanggal dan rekap komponen menu, tandai dikirim dan selesai |
| Manajer Operasional | Lihat pesanan (nomor HP tersamar), laporan penjualan dan piutang, ekspor CSV, cetak |
| Pemilik | Dashboard omzet, tren enam bulan, menu terlaris, tagihan yang lewat |

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

### Teknologi

Next.js 16 (App Router), PostgreSQL (Neon lewat Vercel) dengan Drizzle, Tailwind CSS v4, Motion, Lucide. Rencana dan keputusan teknis ada di [`docs/PROJECT.md`](docs/PROJECT.md) dan [`docs/features/M0-kerangka.md`](docs/features/M0-kerangka.md).

### Menjalankan di lokal

```
cd web
cp .env.example .env.local      # isi SESSION_SECRET dan SEED_PASSWORD
npm install
npm run db:up && npm run db:migrate && npm run db:seed
npm run dev
```

Di lokal, kata sandi akun mengikuti `SEED_PASSWORD` di `web/.env.local` saat `npm run db:seed` dijalankan.

| Perintah | Guna |
|---|---|
| `npm test` | 23 unit test aturan bisnis |
| `npm run test:e2e` | 12 uji alur di browser; butuh database lokal yang sudah di-seed dan Chrome terpasang |
| `npm run lint`, `npm run build` | Harus lulus sebelum deploy |
| `vercel deploy --prod` | Deploy dari folder `web/`; migrasi database berjalan otomatis saat build |

Uji alur menulis data contoh ke database lokal, jadi jangan diarahkan ke database produksi.

### Keamanan

- Kata sandi di-hash dengan bcrypt; cookie sesi `httpOnly`, `secure`, bertanda tangan, berlaku 8 jam.
- Hak akses diperiksa di server pada setiap halaman dan aksi; peran dibaca ulang dari database tiap permintaan.
- Login dibatasi: 5 gagal per akun + IP, 20 per IP, 20 per akun dalam 15 menit.
- Nomor HP pelanggan tersamar untuk selain admin dan tidak tampil di jadwal dapur.
- Semua masukan divalidasi di server; total, uang muka, dan sisa dihitung server di dalam transaksi database.
- Perubahan pesanan, pembayaran, menu, dan pelanggan tercatat di `audit_log`.
- Header keamanan, halaman internal `noindex`, sel CSV dinetralkan dari rumus.

Satu kompromi yang disengaja: seseorang masih bisa mengunci satu akun selama 15 menit dengan 20 kali salah login. Mencegahnya sepenuhnya butuh CAPTCHA.

### Hasil uji terakhir

| Uji | Hasil |
|---|---|
| Unit test | 23 lulus |
| Uji alur otomatis TC-01 sampai TC-15 dan tampilan ponsel 390 px | 12 lulus, termasuk validasi server, penolakan akses per peran, dan pemalsuan status |
| Login keempat akun demo di situs online, semua menu terbuka | Lulus |

## Catatan tentang data

Menurut dosen, data wawancara tidak wajib asli dan boleh dikarang. Data berikut adalah karangan untuk keperluan tugas:

| Data | Nilai | Lokasi |
|---|---|---|
| Nama usaha | Katering Dapur Hebat | Laporan, aplikasi |
| Alamat, jam buka, minimal 25 porsi | Lihat `web/src/lib/situs.ts` | Laporan 1.2, halaman publik |
| Karyawan dan struktur | 8 orang | Laporan 1.1, 1.2 |
| Narasumber dan nama pengguna | Ibu Hj. Nurhayati, Rina Oktaviani, Budi Santoso, Ibu Sari | Laporan, akun demo |
| Wawancara dan observasi | 7 dan 8 November 2026; ringkasan di Lampiran | Laporan 2.1, Lampiran |
| Alur kerja dan lima masalah | Disusun dari pola umum katering kecil dan dua jurnal | Laporan 1.1, 2.2, 2.3 |
| Harga menu | Rp22.000–Rp35.000 | Laporan, aplikasi |
| Angka kelayakan, jadwal P9–P14 | — | Laporan 1.6, 1.7 |
| Pelanggan dan pesanan | Data contoh hasil seed | Aplikasi |

Yang asli: nama, NIM, dan kelas penulis; tujuh menu beserta komposisinya (`asset/info.txt`) dan fotonya; nomor WhatsApp; 19 sumber daftar pustaka.

Daftar pustaka: dari 12 jurnal, metadata 10 sudah dicocokkan ke halaman jurnalnya. Dua jurnal (Hidayati dkk. 2023; Prihati dkk. 2022) dan satu lagi yang halamannya meminta login (Saing dkk. 2021) memakai metadata sebagaimana diberikan. Isi yang dikutip hanya dari abstrak yang terbaca; jurnal lain dikutip untuk pernyataan umum sesuai judulnya.

Komposisi menu mengikuti `asset/info.txt`. Foto menunjukkan tiga perbedaan kecil yang belum dipastikan ke pemilik katering: ayam serundeng dan Paket Hebat 2 tampak memakai sambal, cumi cabe ijo tampak memakai soun atau bihun (tertulis mie goreng), dan Tumpeng Mini memakai nasi kuning yang tidak tertulis.

## Isi folder

| Path | Isi |
|---|---|
| `web/` | Aplikasi |
| `docs/` | Rencana proyek dan keputusan teknis |
| `diagram/` | Empat diagram, `.drawio` dan `.png` |
| `mockup/` | Tujuh tangkapan layar aplikasi yang dipakai laporan, papan mockup FigCraft; file `.html` adalah mockup awal |
| `asset/` | Foto menu dan `info.txt` |
| `fonts/` | Huruf Plus Jakarta Sans |
| `build_gambar.py` | Membuat ulang diagram |
| `Laporan-*.pdf`, `Presentasi-*` | Laporan dan bahan presentasi |

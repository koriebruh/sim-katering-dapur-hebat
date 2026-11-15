# PROJECT — Aplikasi SIM Katering Dapur Hebat

Status: **menunggu persetujuan**. Belum ada kode yang dibuat.

Aplikasi web pendamping laporan `Laporan-SIM-Katering-Dapur-Hebat.docx`: halaman publik (profil dan katalog menu) ditambah sistem internal untuk pesanan, pembayaran, jadwal produksi, laporan, dan dashboard pemilik. Tujuannya demo presentasi tugas SIM, bukan operasi produksi sungguhan.

## Pengguna dan alur utama

| Peran | Alur utama | Kebutuhan |
|---|---|---|
| Pengunjung | Buka halaman publik, lihat menu, klik pesan lewat WhatsApp | F-11 |
| Admin Pemesanan | Login, kelola menu dan pelanggan, catat pesanan, catat DP/pelunasan, cari pesanan | F-01–F-05, F-07, F-08 |
| Kepala Dapur | Login, lihat jadwal produksi dan rekap komponen, ubah status | F-01, F-06, F-07 |
| Manajer Operasional | Login, lihat daftar pesanan, laporan penjualan dan piutang, ekspor | F-01, F-08, F-09 |
| Pemilik | Login, lihat dashboard ringkasan usaha | F-01, F-10 |

## Cakupan

Termasuk: seluruh F-01 sampai F-11 di laporan, data contoh (seed) untuk demo, tampilan responsif, ikon dan animasi ringan, SEO halaman publik.

Tidak termasuk: pemesanan mandiri oleh pelanggan, pembayaran daring, notifikasi WhatsApp otomatis, stok bahan baku, penggajian, multi-cabang, aplikasi mobile.

## Angka sasaran

| Hal | Sasaran |
|---|---|
| Pengguna bersamaan | ≤ 10 (demo) |
| Volume data | ≤ 1.000 pesanan, 7–30 menu |
| Halaman publik | LCP < 2,5 detik, skor Lighthouse SEO ≥ 95 |
| Halaman internal | Tampil < 3 detik (NF-03 di laporan) |
| Biaya | Rp0: paket gratis Vercel dan Neon |

## Stack yang diusulkan

Versi persisnya dicek ke dokumentasi resmi saat `/jcc:plan`, sebelum instalasi.

| Lapisan | Pilihan | Alasan | Ditolak |
|---|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Bawaan Vercel; server component dan server action cukup tanpa API terpisah; metadata/sitemap bawaan untuk SEO | Vite + Express (dua deploy), Laravel (tidak cocok di Vercel) |
| Database | Postgres bawaan Vercel (dibuat dari dashboard Vercel → Storage; di baliknya Neon) | Pilihan user; satu akun dan satu dashboard dengan Vercel; paket gratis; environment variable terisi otomatis | SQLite (tidak persisten di Vercel), Railway (akun user sudah kedaluwarsa), Supabase (akun terpisah) |
| ORM | Drizzle | Skema TypeScript, migrasi SQL yang bisa dibaca, ringan di serverless | Prisma (lebih berat saat cold start), SQL mentah (rawan salah) |
| Autentikasi | Sesi sendiri: hash kata sandi + cookie `httpOnly` bertanda tangan | Hanya 4 akun internal, tanpa pendaftaran publik; sedikit dependensi | Auth.js (berlebih untuk login username/kata sandi), Clerk (layanan pihak ketiga) |
| Validasi | Zod di setiap server action | Satu skema untuk form dan server | Validasi manual |
| UI | Tailwind CSS + shadcn/ui + ikon Lucide + Motion | Komponen aksesibel siap pakai; animasi halus tanpa menulis dari nol | Bootstrap, CSS manual |
| Uji | Vitest (logika uang dan hak akses) + Playwright (alur utama) | Skenario TC-01–TC-15 di laporan dijadikan uji otomatis | Tanpa uji |
| Deploy | Vercel, preview per branch | Permintaan user | — |

## Keamanan dan privasi

- Kata sandi di-hash (bcrypt atau argon2id), tidak pernah disimpan atau dicatat apa adanya.
- Cookie sesi `httpOnly`, `secure`, `sameSite=lax`, bertanda tangan, masa berlaku 8 jam.
- Hak akses dicek di server pada setiap halaman dan aksi, bukan hanya menyembunyikan menu.
- Nomor telepon pelanggan disamarkan (`0812-****-142`) untuk peran selain admin; alamat pelanggan tidak tampil di jadwal dapur selain alamat kirim.
- Semua masukan divalidasi di server; query selalu berparameter lewat ORM.
- Login dibatasi (5 percobaan gagal per 15 menit per akun) dan pesan gagalnya seragam.
- Header keamanan (CSP, `X-Frame-Options`, `Referrer-Policy`) dan halaman internal diberi `noindex`.
- Rahasia hanya di environment variable Vercel; file `.env` tidak masuk git.
- Uang disimpan sebagai bilangan bulat rupiah; total, DP, dan sisa dihitung di server dalam satu transaksi database.
- Setiap perubahan pesanan dan pembayaran dicatat (siapa, kapan, apa).

## SEO halaman publik

Metadata dan Open Graph per halaman, `sitemap.xml`, `robots.txt`, data terstruktur JSON-LD (`LocalBusiness` dan `Menu`), gambar teroptimasi dengan teks alt, HTML semantik, URL kanonik.

## Desain

Arah visual mengikuti mockup di laporan: hijau tua dan jingga hangat, foto menu asli dari `asset/`. Mockup dibuat ulang dengan serius di FigCraft memakai token desain yang sama dengan aplikasi, diekspor ke PNG untuk laporan, lalu diunggah ke Canva oleh user agar link Canva tetap ada.

## Roadmap

| ID | Isi | Ukuran |
|---|---|---|
| M0 | Kerangka: proyek Next.js, skema dan migrasi database, seed data, login dan sesi, layout per peran, deploy pertama ke Vercel | S |
| M1 | Halaman publik + SEO (F-11) | S |
| M2 | Menu, pelanggan, pesanan, pembayaran (F-02–F-05, F-08) | M |
| M3 | Jadwal produksi dan status (F-06, F-07) | S |
| M4 | Laporan, ekspor, dashboard pemilik (F-09, F-10) | M |
| M5 | Uji otomatis TC-01–TC-15, pemeriksaan keamanan, mockup FigCraft, pembaruan laporan | M |

## Pertanyaan terbuka

1. Akun Vercel: deploy dan pembuatan database butuh login dari sisi user (`vercel login`). Sudah punya?
2. Nama domain: pakai `*.vercel.app` bawaan?
3. Repositori: buat repo GitHub baru? Publik atau privat?
4. Nomor WhatsApp di halaman publik: pakai nomor dummy sampai data asli ada?
5. Laporan menyebut "purwarupa aplikasi dikembangkan terpisah". Apakah aplikasi perlu dimasukkan sebagai bagian resmi laporan (tangkapan layar asli menggantikan mockup)? Template hanya meminta rancangan.

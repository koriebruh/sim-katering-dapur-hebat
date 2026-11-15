# SIM Katering — Tracker Laporan Proyek SIM (SDLC)

Tugas **Laporan Proyek Sistem Informasi Manajemen**, Prodi Teknik Informatika, Universitas Pamulang, 2026.

Sumber tugas: [`Template-Laporan-Proyek-SIM-SDLC.docx`](Template-Laporan-Proyek-SIM-SDLC.docx)

## Status

Draf lengkap sudah jadi: **`Laporan-SIM-Katering-Dapur-Hebat.docx`** (31 halaman, 6 bab + daftar pustaka + lampiran), dengan 4 diagram dan 7 mockup sudah ditempel. Gaya penulisan akademis dengan sitasi; basis data di rancangan memakai PostgreSQL.

Rencana aplikasi web (belum dibangun, menunggu persetujuan): [`docs/PROJECT.md`](docs/PROJECT.md).

Draf ini **memakai data dummy**. Template meminta fakta hasil observasi/wawancara, jadi bagian di tabel "Data dummy" wajib diganti dengan data asli sebelum dikumpulkan.

| Fase | Isi | Draf | Final |
|---|---|---|---|
| 0 | Data & keputusan awal | dummy | 1/10 |
| 1 | Bab I Perencanaan Sistem | 7/7 | menunggu data asli |
| 2 | Bab II Analisis Sistem | 8/8 | menunggu data asli |
| 3 | Bab III Desain Sistem | 12/12 | menunggu Canva |
| 4 | Bab IV Rencana Implementasi & Pengujian | 5/5 | menunggu data asli |
| 5 | Bab V Pemeliharaan, Evaluasi, Risiko | 3/3 | cek ulang |
| 6 | Bab VI, Daftar Pustaka, Lampiran | 4/6 | link Canva & bukti belum ada |
| 7 | Finalisasi dokumen | 3/6 | — |
| 8 | Presentasi & revisi | 0/4 | — |

## Isi folder

| Path | Isi |
|---|---|
| `Laporan-SIM-Katering-Dapur-Hebat.docx` | Laporan (hasil `build_laporan.py`) |
| `diagram/` | 4 diagram: file `.drawio` (bisa dibuka di draw.io) + `.png` |
| `mockup/` | 7 layar mockup sementara: `.html` + `.png` (akan diganti hasil FigCraft) |
| `docs/PROJECT.md` | Rencana aplikasi web |
| `asset/` | Foto menu dan `info.txt` (komposisi menu) |
| `build_gambar.py` | Membuat ulang isi `diagram/` dan `mockup/` (butuh `google-chrome`) |
| `build_laporan.py` | Membuat ulang laporan dari template (butuh `python-docx` dan `Pillow`) |

Semua teks laporan dan data dummy ada di `build_laporan.py`. Cara mengganti data: ubah di file itu, lalu jalankan

```
python3 build_gambar.py
python3 build_laporan.py
```

Kalau lebih nyaman mengedit langsung di Word, edit `.docx`-nya saja dan jangan jalankan `build_laporan.py` lagi, karena skrip itu menimpa file laporan.

## Data dummy yang harus diganti

| Data | Nilai dummy sekarang | Muncul di |
|---|---|---|
| Kelas | 05TPLE004 | Cover |
| Nama usaha | Katering Dapur Hebat | Cover, semua bab, mockup |
| Alamat | Jl. Raya Siliwangi No. 45, Pamulang Barat, Tangerang Selatan | 1.2 |
| Jumlah karyawan & struktur | 8 orang: pemilik, manajer operasional, admin, kepala dapur, 2 juru masak, 2 kurir | 1.1, 1.2 |
| Narasumber | Ibu Hj. Nurhayati (Pemilik), Rina Oktaviani (Admin) | 1.2, 2.1, 4.5 |
| Nama lain | Bapak Budi Santoso (Manajer), Ibu Sari (Kepala Dapur) | 4.5, mockup |
| Tanggal wawancara/observasi | 7 dan 8 November 2026 | 2.1 |
| Volume usaha | ±60 pesanan per bulan, 25–100 porsi per pesanan | 1.1 |
| Alur kerja & masalah | Pesan via WhatsApp, catat di buku, DP 50%, rekap bulanan manual; 5 masalah | 1.1, 2.2, 2.3, Gambar 2.1 |
| Harga menu | Rp22.000–Rp35.000 per porsi | Lampiran, mockup, 4.4 |
| Angka kelayakan | Biaya awal Rp6.500.000, kerugian Rp1.000.000/bulan | 1.6 |
| Angka di mockup | Pelanggan, pesanan, omzet, piutang | Gambar 3.5–3.9, 3.4 |
| Jadwal P9–P14 | Pembagian tahap per pertemuan | 1.7 |

Masalah usaha disusun dari pola umum katering kecil yang mencatat manual dan didukung temuan jurnal (Afif et al., 2025; Hakim & Prasetya, 2025), bukan dari wawancara. Sesuaikan dengan kondisi katering aslinya.

Yang bukan dummy: nama, NIM, 7 menu beserta komposisinya (dari `asset/info.txt`), foto menu, dan 19 sumber di daftar pustaka (12 jurnal dari kamu, 7 buku/jurnal umum). Metadata 8 dari 12 jurnal sudah dicek ke halaman jurnalnya; isi yang dikutip hanya dari abstrak yang terbaca (Afif, Hakim, Safita, Anzani, Hardiansyah, Ramadhani), sisanya dikutip untuk pernyataan umum sesuai judulnya. "Minimal pemesanan 25 porsi" di mockup halaman publik juga dummy.

## Yang masih harus dikerjakan

- [ ] Ganti semua data dummy di tabel atas dengan data asli katering
- [ ] **Mockup Canva** — template meminta mockup dibuat di Canva dan link-nya dilampirkan. Mockup sekarang berupa HTML/PNG sementara; akan dibuat ulang di FigCraft, lalu PNG-nya kamu unggah ke Canva, lalu isi link di Lampiran (akses: siapa saja dengan link dapat melihat)
- [ ] **Logo Universitas Pamulang** di cover (masih teks placeholder)
- [ ] **Bukti observasi/wawancara** — tempel foto kegiatan dan catatan wawancara di Lampiran
- [ ] **Perbarui daftar isi** — buka di Word, klik kanan daftar isi → Update Field (Word juga akan menawarkan saat file dibuka)
- [ ] Cek komposisi menu ke pemilik katering (lihat catatan di bawah)
- [ ] Baca ulang seluruh laporan setelah data asli masuk; pastikan kesimpulan 6.1 masih menjawab rumusan masalah 1.3
- [ ] Bahan presentasi (P13) — format tidak disebut di template, tanyakan ke dosen
- [ ] Presentasi (P13), catat umpan balik
- [ ] Revisi (P14) dan isi Tabel Catatan Revisi di Lampiran

## Catatan menu: `info.txt` vs foto

Laporan mengikuti `info.txt` (salah ketik "kancang" dan "bunci" sudah diperbaiki). Foto menunjukkan beberapa perbedaan yang perlu dipastikan:

- Nasi box ayam serundeng dan Paket Hebat 2: di foto ada sambal, di `info.txt` tidak tertulis.
- Nasi box cumi cabe ijo: tertulis "mie goreng", di foto terlihat seperti soun/bihun goreng.
- Tumpeng Mini: di foto memakai nasi kuning, di `info.txt` nasinya tidak tertulis.

## Keterlacakan kebutuhan fungsional

Template mewajibkan setiap F-xx terlihat di diagram dan/atau mockup.

| Kode | Kebutuhan | Diagram (DFD level 1) | Mockup | Skenario uji |
|---|---|---|---|---|
| F-01 | Login & hak akses per peran | — | Gambar 3.4, 3.5 | TC-01, 02, 03 |
| F-02 | Kelola menu & paket | Proses 1.0 | Gambar 3.6 | TC-04 |
| F-03 | Kelola pelanggan | Proses 1.0 | Gambar 3.6 | TC-05 |
| F-04 | Catat pesanan, total otomatis | Proses 2.0 | Gambar 3.6 | TC-06, 07 |
| F-05 | Catat DP & pelunasan, sisa tagihan | Proses 3.0 | Gambar 3.6, 3.7 | TC-08, 09 |
| F-06 | Jadwal produksi & rekap komponen | Proses 4.0 | Gambar 3.5 | TC-10 |
| F-07 | Perbarui status pesanan | Proses 4.0 | Gambar 3.5, 3.7 | TC-11 |
| F-08 | Cari & daftar pesanan | Proses 2.0 | Gambar 3.7 | TC-12 |
| F-09 | Laporan penjualan & piutang | Proses 5.0 | Gambar 3.8 | TC-13 |
| F-10 | Dashboard ringkasan usaha | Proses 5.0 | Gambar 3.9 | TC-14 |
| F-11 | Halaman publik profil & menu | — | Gambar 3.10 | TC-15 |

## Syarat minimum template

| Syarat | Minimum | Di draf |
|---|---|---|
| Latar belakang | 2–4 paragraf | 4 |
| Rumusan masalah | 3–5 pertanyaan | 4 |
| Proses di DFD level 1 | 4 + data store | 5 proses, 4 data store |
| Entitas ERD + kamus data | 4 | 6 |
| Laporan | 2 | 3 |
| Layar mockup | 6 | 7 |
| Skenario uji black-box | 8 | 15 |
| Dimensi DeLone & McLean | 6 | 6 |
| Sumber daftar pustaka (APA) | 5 | 19 |

Format mengikuti gaya bawaan template: A4; margin kiri 4 cm, lainnya 3 cm; Times New Roman 12 pt; spasi 1,5; rata kanan-kiri.

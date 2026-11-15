# M0 — Kerangka aplikasi

Status: **APPROVED** (user: "lanjut dah", 15 November 2026). Lane: M.

## Ringkasan

Fondasi aplikasi di `web/`: Next.js 16 (App Router), skema Postgres lewat Drizzle, data contoh, login dengan sesi, kerangka halaman per peran. Memenuhi F-01.

## Kriteria penerimaan

| # | Given / When / Then | Uji |
|---|---|---|
| 1 | Akun benar → login → masuk dashboard sesuai peran | manual + Playwright (M5), TC-01 |
| 2 | Kata sandi salah → pesan seragam, tetap di halaman login | TC-02 |
| 3 | 5 kali gagal dalam 15 menit → login akun itu ditolak sementara | manual |
| 4 | Tanpa sesi membuka `/dashboard` → dialihkan ke `/login` | manual |
| 5 | Peran tanpa hak membuka halaman → dialihkan dengan pesan akses ditolak | TC-03 (halaman menyusul di M2–M4) |
| 6 | Nomor HP tersamar untuk selain admin | `format.test.ts` |
| 7 | `npm run build` dan `npm test` lulus | CI lokal |

## Keputusan

| Hal | Pilihan | Alasan | Ditolak |
|---|---|---|---|
| Driver DB | `postgres` (postgres.js), `prepare: false` | Satu driver untuk Postgres lokal (Docker) dan Postgres Vercel lewat pooler | Driver HTTP Neon (tidak bisa ke Postgres lokal) |
| Hash | `bcryptjs`, cost 12 | JavaScript murni, tanpa kompilasi native di Vercel | argon2 native |
| Sesi | JWT HS256 (`jose`) di cookie `httpOnly`, 8 jam, hanya berisi id | Tanpa tabel sesi; peran dibaca ulang dari DB tiap request sehingga akun nonaktif langsung terputus | Sesi di database |
| Pembatasan login | Tabel `percobaan_login` | Tanpa Redis; volume kecil | Upstash |
| Hak akses | `wajibLogin(peran)` di tiap halaman dan action; `NAV` di `lib/roles.ts` satu-satunya daftar hak | Layout tidak dirender ulang saat navigasi, jadi tidak boleh jadi satu-satunya penjaga | Proxy/middleware saja |
| Cache Components | Dimatikan | Semua halaman internal dinamis per pengguna; mengurangi jebakan | Dibiarkan aktif |
| Migrasi di Vercel | `drizzle-kit migrate` sebelum `next build` | Satu langkah deploy | Migrasi manual |
| Uang | `integer` rupiah + `CHECK` | Tidak ada pecahan rupiah | `numeric` |

Sengaja tidak dibuat: shadcn/ui (komponen masih sedikit), proxy.ts, pendaftaran akun, lupa kata sandi.

## Catatan

`pesanan.id` berupa `serial` dengan kolom `kode` unik (`PSN-2611-018`), berbeda dari kamus data laporan yang menjadikan kode sebagai kunci utama. Laporan disesuaikan di M5.

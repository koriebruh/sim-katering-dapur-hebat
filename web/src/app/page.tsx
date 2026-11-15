import Link from "next/link";

// Halaman publik lengkap dibuat di M1.
export default function Beranda() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-bold text-brand-800">Katering Dapur Hebat</h1>
        <p className="mt-2 text-muted">Nasi box dan tumpeng untuk setiap acara Anda.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">
          Masuk karyawan
        </Link>
      </div>
    </main>
  );
}

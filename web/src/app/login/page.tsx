import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, Noda } from "@/components/ilustrasi";
import { penggunaAktif } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk", robots: { index: false, follow: false } };

export default async function HalamanLogin() {
  if (await penggunaAktif()) redirect("/dashboard");
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-cream p-5">
      <Noda className="-left-40 -top-40 w-[560px]" />
      <Noda className="-bottom-52 -right-40 w-[640px]" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-accent-500/5 lg:grid-cols-2">
        <div className="relative hidden min-h-[520px] lg:block">
          <Image src="/menu/tumpeng-mini.jpg" alt="" fill priority sizes="450px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/10 to-transparent" />
          <p className="absolute inset-x-8 bottom-8 text-xl font-bold leading-snug text-white">Pesanan, pembayaran, dan jadwal dapur dalam satu tempat.</p>
        </div>
        <div className="p-8 sm:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 text-lg font-extrabold text-ink"><Logo /> Dapur Hebat</Link>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

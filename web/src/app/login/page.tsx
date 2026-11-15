import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { penggunaAktif } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk", robots: { index: false, follow: false } };

export default async function HalamanLogin() {
  if (await penggunaAktif()) redirect("/dashboard");
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden lg:block">
        <Image src="/menu/tumpeng-mini.jpg" alt="" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-brand-900/65 p-14 text-white">
          <Link href="/" className="text-3xl font-bold">Katering Dapur Hebat</Link>
          <p className="mt-2 text-white/85">Sistem Informasi Pemesanan dan Produksi Katering</p>
        </div>
      </div>
      <div className="grid place-items-center bg-cream p-6">
        <LoginForm />
      </div>
    </main>
  );
}

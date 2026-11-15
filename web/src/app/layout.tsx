import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

const SITUS = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITUS),
  title: { default: "Katering Dapur Hebat — Nasi Box & Tumpeng Pamulang", template: "%s | Katering Dapur Hebat" },
  description: "Katering nasi box, paket nasi, dan tumpeng mini untuk acara kantor, sekolah, dan keluarga di Pamulang, Tangerang Selatan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}

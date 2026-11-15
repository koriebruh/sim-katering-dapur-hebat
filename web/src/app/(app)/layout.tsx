import type { Metadata } from "next";
import { wajibLogin } from "@/lib/dal";
import { LABEL_PERAN, NAV } from "@/lib/roles";
import { Sidebar } from "./sidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Layout hanya menyusun kerangka. Pemeriksaan hak akses yang mengikat ada di tiap halaman (wajibLogin).
export default async function LayoutInternal({ children }: { children: React.ReactNode }) {
  const u = await wajibLogin();
  const nav = NAV.filter((n) => n.peran.includes(u.peran)).map(({ href, label, ikon }) => ({ href, label, ikon }));
  return (
    <div className="flex min-h-dvh flex-col bg-cream md:flex-row">
      <Sidebar nav={nav} nama={u.nama} peran={LABEL_PERAN[u.peran]} />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-8 print:p-0">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

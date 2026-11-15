"use client";

import { Printer } from "lucide-react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Muncul dengan geser halus saat masuk layar. `urut` memberi jeda bertingkat. */
export function Muncul({ children, urut = 0, className }: { children: React.ReactNode; urut?: number; className?: string }) {
  const diam = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={diam ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(urut, 8) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Angka yang menghitung naik sekali saat terlihat. Nilai akhir tetap ada di HTML untuk pembaca layar. */
export function Angka({ nilai, awalan = "" }: { nilai: number; awalan?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const terlihat = useInView(ref, { once: true });
  const diam = useReducedMotion();
  const fmt = (n: number) => awalan + Math.round(n).toLocaleString("id-ID");
  useEffect(() => {
    if (!terlihat || diam || !ref.current) return;
    const el = ref.current;
    const c = animate(0, nilai, { duration: 0.9, ease: "easeOut", onUpdate: (v) => { el.textContent = fmt(v); } });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terlihat, nilai, diam]);
  return <span ref={ref} className="tabular-nums">{fmt(nilai)}</span>;
}

/** Diagram batang sederhana; batang tumbuh dari bawah. */
export function Batang({ data, satuan }: { data: { label: string; nilai: number }[]; satuan: string }) {
  const diam = useReducedMotion();
  const maks = Math.max(1, ...data.map((d) => d.nilai));
  return (
    <figure>
      <div className="flex h-44 items-end gap-3" role="img" aria-label={`Diagram batang ${satuan}: ${data.map((d) => `${d.label} ${d.nilai.toLocaleString("id-ID")}`).join(", ")}`}>
        {data.map((d, i) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end">
            <div className="mb-1 text-center text-[11px] font-semibold text-ink">{(d.nilai / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}</div>
            <motion.div
              className={`rounded-t-lg ${i === data.length - 1 ? "bg-accent-500" : "bg-accent-500/35"}`}
              style={{ height: `${Math.max(2, (d.nilai / maks) * 100)}%`, originY: 1 }}
              initial={diam ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => <div key={d.label} className="flex-1 text-center text-xs text-muted">{d.label}</div>)}
      </div>
      <figcaption className="mt-2 text-xs text-muted">{satuan}</figcaption>
    </figure>
  );
}

export function TombolCetak({ className }: { className: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer size={16} aria-hidden /> Cetak
    </button>
  );
}

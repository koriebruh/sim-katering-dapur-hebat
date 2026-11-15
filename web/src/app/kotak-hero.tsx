"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

/** Foto hero bundar dengan kartu harga yang mengambang, seperti pada desain referensi. */
export function FotoHero({ foto, alt, harga, minimal }: { foto: string; alt: string; harga: string; minimal: number }) {
  const diam = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <motion.div
        className="absolute inset-[6%] overflow-hidden rounded-full shadow-2xl shadow-accent-500/25 ring-8 ring-white"
        initial={diam ? false : { scale: 0.82, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Image src={foto} alt={alt} fill priority sizes="(min-width: 1024px) 400px, 80vw" className="object-cover" />
      </motion.div>

      <motion.div
        className="absolute -right-1 top-[12%] rounded-2xl bg-white px-4 py-3 shadow-xl shadow-stone-900/10 ring-1 ring-line sm:right-0"
        initial={diam ? false : { opacity: 0, y: 16 }}
        animate={diam ? { opacity: 1 } : { opacity: 1, y: [0, -7, 0] }}
        transition={diam ? undefined : { opacity: { delay: 0.5, duration: 0.4 }, y: { delay: 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="text-xs text-muted">Mulai dari</div>
        <div className="text-xl font-extrabold text-ink">{harga}</div>
        <div className="text-xs font-semibold text-accent-600">per porsi</div>
      </motion.div>

      <motion.div
        className="absolute -left-1 bottom-[10%] rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:left-0"
        initial={diam ? false : { opacity: 0, y: 16 }}
        animate={diam ? { opacity: 1 } : { opacity: 1, y: [0, 6, 0] }}
        transition={diam ? undefined : { opacity: { delay: 0.7, duration: 0.4 }, y: { delay: 0.7, duration: 5, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="text-xs opacity-70">Minimal pesan</div>
        <div className="font-extrabold">{minimal} porsi</div>
      </motion.div>
    </div>
  );
}

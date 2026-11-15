"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

/** Kotak nasi kraft yang tutupnya terbuka sekali saat halaman dimuat. */
export function KotakHero({ foto, alt }: { foto: string; alt: string }) {
  const diam = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-xl pt-[40%] sm:pt-[36%] [perspective:1400px]">
      <div className="relative rounded-xl bg-kraft-500 p-3 shadow-[0_14px_0_-4px_var(--color-kraft-700)] sm:p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-kraft-100">
          <Image src={foto} alt={alt} fill priority sizes="(min-width: 1024px) 560px, 92vw" className="object-cover" />
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-0 grid origin-top place-items-center rounded-xl bg-kraft-400 [transform-style:preserve-3d]"
          initial={diam ? false : { rotateX: 0 }}
          animate={{ rotateX: 118 }}
          transition={{ delay: 0.45, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="rounded-full border-2 border-kraft-700/50 px-5 py-2 text-lg font-extrabold text-kraft-700 [backface-visibility:hidden]">
            Dapur Hebat
          </span>
        </motion.div>
      </div>
    </div>
  );
}

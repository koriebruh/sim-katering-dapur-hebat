"use client";

import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useActionState, useState } from "react";
import { kelas } from "@/components/ui";
import { masuk } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(masuk, undefined);
  const [lihat, setLihat] = useState(false);

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Masuk</h1>
      <p className="mt-1 text-sm text-muted">Gunakan akun sesuai peran Anda.</p>

      <label htmlFor="username" className={`${kelas.label} mt-6`}>Nama pengguna</label>
      <input id="username" name="username" required autoComplete="username" autoCapitalize="none" maxLength={30} className={kelas.input} />

      <label htmlFor="password" className={`${kelas.label} mt-4`}>Kata sandi</label>
      <div className="relative">
        <input id="password" name="password" required type={lihat ? "text" : "password"} autoComplete="current-password" maxLength={100} className={`${kelas.input} pr-11`} />
        <button
          type="button" onClick={() => setLihat((v) => !v)} aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink"
        >
          {lihat ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <motion.p
        key={state?.pesan ?? "kosong"} role="alert" aria-live="polite"
        animate={state?.pesan ? { x: [0, -6, 6, -4, 0] } : undefined} transition={{ duration: 0.35 }}
        className="mt-3 min-h-5 text-sm text-red-700"
      >
        {state?.pesan}
      </motion.p>

      <button type="submit" disabled={pending} className={`${kelas.tombol} mt-2 w-full !py-3`}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </motion.form>
  );
}

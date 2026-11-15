"use client";

import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useActionState, useState } from "react";
import { masuk } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(masuk, undefined);
  const [lihat, setLihat] = useState(false);

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm"
    >
      <h1 className="text-2xl font-bold text-ink">Masuk</h1>
      <p className="mt-1 text-sm text-muted">Gunakan akun sesuai peran Anda.</p>

      <label htmlFor="username" className="mt-6 block text-xs font-medium text-muted">Nama pengguna</label>
      <input
        id="username" name="username" required autoComplete="username" autoCapitalize="none" maxLength={30}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none transition focus:border-brand-800 focus:ring-2 focus:ring-brand-100"
      />

      <label htmlFor="password" className="mt-4 block text-xs font-medium text-muted">Kata sandi</label>
      <div className="relative mt-1">
        <input
          id="password" name="password" required type={lihat ? "text" : "password"} autoComplete="current-password" maxLength={100}
          className="w-full rounded-lg border border-line px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-brand-800 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button" onClick={() => setLihat((v) => !v)}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-ink"
        >
          {lihat ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <p role="alert" aria-live="polite" className="mt-3 min-h-5 text-sm text-red-700">{state?.pesan}</p>

      <button
        type="submit" disabled={pending}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 active:scale-[0.98] disabled:opacity-70"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </motion.form>
  );
}

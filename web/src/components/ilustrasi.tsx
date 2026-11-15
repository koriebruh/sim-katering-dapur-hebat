// SVG buatan sendiri: logo, noda latar, dan ilustrasi keadaan kosong.

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="3" y="13" width="26" height="15" rx="4" fill="var(--color-accent-500)" />
      <path d="M3 17h26" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85" />
      <path d="M11 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4M21 9c0-2 2-2 2-4" stroke="var(--color-accent-500)" strokeWidth="2" strokeLinecap="round" className="uap" />
    </svg>
  );
}

/** Noda gradasi lembut untuk latar. Murni dekorasi. */
export function Noda({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden className={`pointer-events-none absolute ${className}`}>
      <defs>
        <radialGradient id="noda" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path fill="url(#noda)" d="M300 30c110 0 250 70 265 200s-70 260-205 320S70 520 40 380 190 30 300 30Z" />
    </svg>
  );
}

export function GambarKosong() {
  return (
    <svg width="132" height="104" viewBox="0 0 132 104" fill="none" aria-hidden>
      <ellipse cx="66" cy="94" rx="46" ry="6" fill="var(--color-line)" />
      <path d="M22 42 34 22h64l12 20v38a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V42Z" fill="var(--color-accent-100)" stroke="var(--color-accent-500)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 42h30a14 14 0 0 0 28 0h30" stroke="var(--color-accent-500)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M58 6v8M74 6v8M66 2v10" stroke="var(--color-accent-500)" strokeWidth="2.5" strokeLinecap="round" className="uap" />
    </svg>
  );
}

/** Garis gelombang di bawah judul hero. */
export function Gelombang({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 14" fill="none" aria-hidden className={className}>
      <path d="M3 9c18-8 36-8 54 0s36 8 54 0 36-8 54 0 36 8 52 0" stroke="var(--color-accent-500)" strokeWidth="4" strokeLinecap="round" className="garis-tulis" />
    </svg>
  );
}

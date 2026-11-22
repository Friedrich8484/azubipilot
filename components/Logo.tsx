import Link from 'next/link';

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <rect width="30" height="30" rx="9" fill="#14243A" />
      <circle cx="15" cy="15" r="8" fill="none" stroke="#3978E8" strokeWidth="2" />
      <path
        d="M15 7l4 8-4 8"
        fill="none"
        stroke="#36C9B5"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ href = '/', light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight ${
        light ? 'text-white' : 'text-ink'
      }`}
    >
      <LogoMark />
      AzubiPilot
    </Link>
  );
}

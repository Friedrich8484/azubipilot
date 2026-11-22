'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { logout } from '@/app/auth/actions';

const NAV = [
  ['/dashboard', 'home', 'Dashboard'],
  ['/lernen', 'book', 'Lernen'],
  ['/quiz', 'quiz', 'Quiz'],
  ['/planer', 'cal', 'Prüfungsplaner'],
  ['/materialien', 'layers', 'Materialien'],
  ['/ki', 'spark', 'AzubiPilot KI'],
  ['/profil', 'user', 'Profil'],
] as const;

export function AppNav({ name, planLabel }: { name: string; planLabel: string }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 z-20 flex items-center gap-2 bg-navy px-2 py-2 text-[#C9D3E2] md:h-screen md:flex-col md:items-stretch md:gap-5 md:px-3.5 md:py-5">
      <div className="px-2 md:px-2">
        <span className="md:hidden">
          <Link href="/dashboard" aria-label="AzubiPilot Dashboard" className="inline-flex">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
              <rect width="30" height="30" rx="9" fill="#fff" fillOpacity=".1" />
              <circle cx="15" cy="15" r="8" fill="none" stroke="#3978E8" strokeWidth="2" />
              <path d="M15 7l4 8-4 8" fill="none" stroke="#36C9B5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </span>
        <span className="hidden md:inline-flex">
          <Logo href="/dashboard" light />
        </span>
      </div>
      <nav aria-label="App-Navigation" className="flex flex-1 gap-0.5 overflow-x-auto md:flex-none md:flex-col">
        {NAV.map(([href, icon, label]) => {
          const on = path === href || path.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? 'page' : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-sm font-medium hover:bg-[#22385A] hover:text-white md:text-[15px] ${
                on ? 'bg-[#22385A] text-white' : ''
              }`}
            >
              <Icon name={icon} className={`hidden h-5 w-5 md:block ${on ? 'text-teal' : ''}`} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/preise"
          className="flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-sm font-medium hover:bg-[#22385A] hover:text-white md:text-[15px]"
        >
          <Icon name="tag" className="hidden h-5 w-5 md:block" />
          Preise
        </Link>
      </nav>
      <div className="mt-auto hidden rounded-xl bg-[#22385A] p-3 text-sm text-white md:block">
        <b>{name || 'Du'}</b>
        <div className="text-xs opacity-80">Plan: {planLabel}</div>
        <form action={logout} className="mt-2">
          <button className="flex items-center gap-2 text-xs opacity-90 hover:underline">
            <Icon name="out" className="h-4 w-4" /> Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}

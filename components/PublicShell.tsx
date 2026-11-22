import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/Logo';

export async function PublicHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
          <a href="/#funktionen" className="hidden rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft sm:block">
            Funktionen
          </a>
          <Link href="/preise" className="hidden rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft sm:block">
            Preise
          </Link>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Zum Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft">
                Anmelden
              </Link>
              <Link href="/registrieren" className="btn btn-primary">
                Kostenlos starten
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-20 bg-navy text-[#C9D3E2]">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-8 px-4 py-10">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-3 text-sm">Die Lernplattform für Auszubildende in Deutschland.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/preise" className="text-white">
            Preise
          </Link>
          <Link href="/impressum" className="text-white">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-white">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}

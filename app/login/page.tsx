import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { LoginForm } from '@/components/AuthForms';

export const metadata: Metadata = { title: 'Anmelden' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  const sp = await searchParams;
  const notice =
    sp.fehler === 'bestaetigung'
      ? 'Der Bestätigungslink ist ungültig oder abgelaufen. Melde dich an oder registriere dich erneut.'
      : undefined;
  return (
    <>
      <PublicHeader />
      <main className="mx-auto my-14 max-w-[440px] px-4">
        <div className="card">
          <h1 className="mb-5 text-3xl font-extrabold tracking-tight">Willkommen zurück</h1>
          <LoginForm notice={notice} />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

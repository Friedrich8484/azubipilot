import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { RegisterForm } from '@/components/AuthForms';

export const metadata: Metadata = { title: 'Registrieren' };

export default function RegisterPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto my-14 max-w-[440px] px-4">
        <div className="card">
          <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Konto anlegen</h1>
          <p className="mb-5 text-sm text-muted">Kostenlos starten. Du brauchst keine Zahlungsdaten.</p>
          <RegisterForm />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

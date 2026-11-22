import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImpressumPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 pt-14">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Impressum</h1>
        <div className="notice mb-6 bg-danger-soft">
          Platzhalter. Diese Seite muss vor dem Livegang vom Betreiber mit echten Angaben befüllt und rechtlich
          geprüft werden.
        </div>
        <p className="mb-3">
          Hier gehören die Pflichtangaben nach § 5 DDG hin, zum Beispiel Name und Anschrift des Anbieters, eine
          schnelle Kontaktmöglichkeit per E-Mail und gegebenenfalls Angaben zu Registereintrag und
          Umsatzsteuer-ID.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}

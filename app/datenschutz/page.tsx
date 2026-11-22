import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';

export const metadata: Metadata = { title: 'Datenschutz' };

export default function DatenschutzPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 pt-14">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Datenschutzerklärung</h1>
        <div className="notice mb-6 bg-danger-soft">
          Platzhalter. Diese Seite muss vor dem Livegang vom Betreiber mit echten Angaben befüllt und rechtlich
          geprüft werden.
        </div>
        <p className="mb-3">
          Hier gehört die Datenschutzerklärung nach DSGVO hin. Sie muss unter anderem den Verantwortlichen, Zwecke
          und Rechtsgrundlagen der Verarbeitung, die eingesetzten Dienstleister (Hosting bei Vercel, Datenbank und
          Dateispeicher bei Supabase, optional KI-Anbieter), die Speicherdauer sowie die Rechte der Nutzer auf
          Auskunft, Berichtigung und Löschung nennen.
        </p>
        <p className="mb-3">
          Gespeichert werden Vorname, E-Mail-Adresse, Lernfortschritt, Quiz-Ergebnisse, Lernpläne und von dir
          hochgeladene Dateien. Jeder Nutzer kann nur auf seine eigenen Daten zugreifen.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}

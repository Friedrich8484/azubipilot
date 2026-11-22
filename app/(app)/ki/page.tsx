import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { KiChat } from '@/components/KiChat';

export const metadata: Metadata = { title: 'AzubiPilot KI' };

export default async function KiPage() {
  const { plan } = await requireUser();
  const enabled = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">AzubiPilot KI</h1>
        <p className="text-muted">Dein Lernassistent für Erklärungen, Übungsfragen und Lernpläne.</p>
      </div>

      {plan !== 'ultimate' ? (
        <div className="card">
          <span className="pill">Ultimate</span>
          <h2 className="mt-2.5 text-xl font-bold">Der KI-Lernassistent gehört zum Ultimate-Plan</h2>
          <p className="mb-4 mt-2 text-muted">
            Mit Ultimate nutzt du die KI mit fairen Tageslimits. Die Bezahlung ist noch nicht freigeschaltet.
          </p>
          <Link href="/preise" className="btn btn-secondary">Pläne ansehen</Link>
        </div>
      ) : !enabled ? (
        <div className="card">Die KI ist noch nicht eingerichtet. Der Betreiber muss einen API-Schlüssel hinterlegen.</div>
      ) : (
        <>
          <div className="notice mb-4">
            Die KI kann sich irren. Prüfe wichtige Angaben, zum Beispiel Fristen oder Gesetze, bei deiner zuständigen
            Stelle oder in aktuellen Quellen.
          </div>
          <KiChat />
        </>
      )}
    </div>
  );
}

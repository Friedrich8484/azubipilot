import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { PricingCards } from '@/components/PricingCards';
import { Icon } from '@/components/Icon';

const FEATURES = [
  ['book', 'Strukturierte Lektionen', 'Lernziel, Erklärung, Praxisbeispiele, Zusammenfassung und Verständnisfragen in jeder Lektion.'],
  ['quiz', 'Quiz mit sofortigem Feedback', 'Multiple-Choice-Fragen mit Erklärung zu jeder Antwort und einer Auswertung am Ende.'],
  ['cal', 'Prüfungsplaner', 'Prüfungstermin eintragen und aus offenen Lektionen einen Lernplan erzeugen.'],
  ['layers', 'Lernmaterialien', 'Lernzettel, Zusammenfassungen, Karteikarten, Checklisten und Vorlagen nach Thema.'],
  ['upload', 'Eigenes Material hochladen', 'Lade deine Unterlagen als PDF, Bild oder Text hoch. Im kostenlosen Plan bis zu 5 Dateien.'],
  ['spark', 'AzubiPilot KI', 'Erklärungen, Übungsfragen und Lernpläne mit fairen Nutzungslimits im Ultimate-Plan.'],
] as const;

const FAQ = [
  ['Für wen ist AzubiPilot gedacht?', 'Für Auszubildende in Deutschland. Wir starten mit Kaufleuten für Büromanagement. Weitere Ausbildungsberufe sind geplant, aber noch nicht verfügbar.'],
  ['Kann ich AzubiPilot kostenlos nutzen?', 'Ja. Der kostenlose Zugang enthält begrenzte Lernmaterialien, einige Quizze, ein Basis-Dashboard und bis zu 5 eigene Dateien.'],
  ['Sind die Inhalte offizielle Prüfungsfragen?', 'Nein. Alle Inhalte sind eigene Lernmaterialien. Offizielle Prüfungsaufgaben werden nicht kopiert.'],
  ['Wie sicher sind meine Daten?', 'Jeder Nutzer kann nur auf seine eigenen Daten zugreifen. Hochgeladene Dateien liegen in einem privaten Speicher. Details stehen in der Datenschutzerklärung.'],
  ['Kann ich ein Abo jederzeit beenden?', 'Abonnements werden nur nach ausdrücklicher Zustimmung abgeschlossen. Die Kündigungsbedingungen stehen vor dem Abschluss auf der Preisseite.'],
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-8 pt-12 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-16">
          <div>
            <p className="eyebrow">Für Kaufleute für Büromanagement</p>
            <h1 className="mt-3.5 max-w-[15ch] text-[clamp(2.2rem,6vw,3.75rem)] font-extrabold leading-[1.1] tracking-[-0.035em]">
              Deine Ausbildung. Dein Plan. Dein Erfolg.
            </h1>
            <p className="mt-5 max-w-[56ch] text-lg text-muted">
              Lerne smarter, organisiere deine Ausbildung und bereite dich mit AzubiPilot optimal auf deine
              Prüfungen vor.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={user ? '/dashboard' : '/registrieren'} className="btn btn-primary px-6 py-3.5 text-base">
                Kostenlos starten <Icon name="arrow" />
              </Link>
              <a href="#funktionen" className="btn btn-secondary px-6 py-3.5 text-base">
                Funktionen entdecken
              </a>
            </div>
          </div>

          <div className="min-w-0 rounded-[20px] border border-line bg-white p-5 shadow-[0_24px_60px_rgba(20,36,58,.14)]" aria-label="Vorschau des Dashboards mit Beispieldaten">
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Beispieldaten</p>
                <p className="text-lg font-bold">Hallo, Alex</p>
              </div>
              <span className="pill pill-ok">Premium</span>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted">Lernfortschritt</p>
              <p className="font-bold">4 von 6 Lektionen erledigt</p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full w-[66%] rounded-full bg-teal" />
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-line p-3">
                <span><b>Heute:</b> Quiz Büroorganisation</span>
                <span className="pill">15 Min.</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line p-3">
                <span><b>Nächste Prüfung:</b> Teil 1</span>
                <span className="pill pill-grey">in 34 Tagen</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line p-3">
                <span><b>Quiz-Ergebnis:</b> Kaufvertrag</span>
                <span className="pill pill-ok">8 von 10 richtig</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-20">
          <p className="eyebrow">Vorteile</p>
          <h2 className="mt-2 max-w-[22ch] text-3xl font-extrabold tracking-tight md:text-4xl">Lernen, das zu deinem Alltag passt</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Weniger Chaos', 'Alles zur Ausbildung an einem Ort: Lernstoff, Termine und Aufgaben.'],
              ['Verstehen statt Auswendiglernen', 'Erklärungen in einfacher Sprache mit Beispielen aus dem Büroalltag.'],
              ['Klarer Weg zur Prüfung', 'Du siehst, was offen ist, und planst es in kleinen Schritten.'],
            ].map(([t, d]) => (
              <div key={t} className="card">
                <h3 className="text-lg font-bold">{t}</h3>
                <p className="mt-2 text-muted">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="funktionen" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20">
          <p className="eyebrow">Funktionen</p>
          <h2 className="mt-2 max-w-[22ch] text-3xl font-extrabold tracking-tight md:text-4xl">Alles, was du für die Prüfung brauchst</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([icon, title, text]) => (
              <div key={title} className="card">
                <div className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-brand-soft text-brand-dark">
                  <Icon name={icon} />
                </div>
                <h3 className="mb-1.5 mt-3 text-[17px] font-bold">{title}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-20">
          <p className="eyebrow">So funktioniert es</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">In drei Schritten startklar</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ['Konto anlegen', 'Vorname, E-Mail, Passwort und Ausbildungsjahr genügen.'],
              ['Lernen und üben', 'Lektionen lesen, Quiz lösen und Fortschritt speichern.'],
              ['Prüfung planen', 'Termin eintragen und den Lernplan Schritt für Schritt abhaken.'],
            ].map(([t, d], i) => (
              <div key={t}>
                <span className="mb-3 grid h-[34px] w-[34px] place-items-center rounded-full bg-navy text-[15px] font-bold text-white">{i + 1}</span>
                <h3 className="text-lg font-bold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-20">
          <p className="eyebrow">Preise</p>
          <h2 className="mt-2 mb-8 text-3xl font-extrabold tracking-tight md:text-4xl">Transparent und ohne Überraschungen</h2>
          <PricingCards loggedIn={!!user} />
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-20">
          <p className="eyebrow">Häufige Fragen</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Gut zu wissen</h2>
          <div className="mt-6 max-w-3xl">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none justify-between gap-3 font-semibold">
                  {q}
                  <span className="text-xl leading-none text-muted group-open:hidden">+</span>
                  <span className="hidden text-xl leading-none text-muted group-open:inline">–</span>
                </summary>
                <p className="mt-2.5 max-w-[70ch] text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

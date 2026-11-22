import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { Bar } from '@/components/Ring';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Lernen' };

type Mod = {
  id: string;
  title: string;
  description: string;
  training_year: number;
  position: number;
  lessons: { id: string; title: string; position: number }[];
};

export default async function LernenPage({ searchParams }: { searchParams: Promise<{ jahr?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await requireUser();

  const [{ data }, { data: progress }] = await Promise.all([
    supabase
      .from('learning_modules')
      .select('id, title, description, training_year, position, lessons(id, title, position)')
      .order('position'),
    supabase.from('learning_progress').select('lesson_id').eq('user_id', user.id),
  ]);

  const mods = (data ?? []) as unknown as Mod[];
  const done = new Set((progress ?? []).map((p) => p.lesson_id));
  const year = sp.jahr ?? String(profile.training_year);
  const shown = mods.filter((m) => year === 'alle' || String(m.training_year) === year);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Lernen</h1>
        <p className="text-muted">Wähle Beruf und Ausbildungsjahr.</p>
      </div>

      <form className="card grid gap-4 sm:grid-cols-2" method="get">
        <div>
          <label htmlFor="prog" className="label">Ausbildungsberuf</label>
          <select id="prog" className="input" defaultValue="bm">
            <option value="bm">Kaufmann/-frau für Büromanagement</option>
            <option disabled>Weitere Berufe, in Planung</option>
          </select>
        </div>
        <div>
          <label htmlFor="jahr" className="label">Ausbildungsjahr</label>
          <div className="flex gap-2">
            <select id="jahr" name="jahr" className="input" defaultValue={year}>
              <option value="alle">Alle Jahre</option>
              <option value="1">1. Jahr</option>
              <option value="2">2. Jahr</option>
              <option value="3">3. Jahr</option>
            </select>
            <button className="btn btn-secondary">Anzeigen</button>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-4">
        {shown.length === 0 && <div className="card text-muted">Für dieses Jahr sind noch keine Module vorhanden.</div>}
        {shown.map((m) => {
          const ls = [...m.lessons].sort((a, b) => a.position - b.position);
          const d = ls.filter((l) => done.has(l.id)).length;
          return (
            <section key={m.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="pill pill-grey">{m.training_year}. Jahr</span>
                  <h2 className="mt-2 text-xl font-bold">{m.title}</h2>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                </div>
                <span className="text-sm text-muted tabular-nums">{d}/{ls.length}</span>
              </div>
              <div className="my-3.5">
                <Bar percent={ls.length ? (d / ls.length) * 100 : 0} />
              </div>
              <div className="divide-y divide-line">
                {ls.map((l) => (
                  <Link key={l.id} href={`/lernen/${l.id}`} className="flex items-center gap-3 py-3">
                    <span className={`grid h-7 w-7 flex-none place-items-center rounded-full text-ok ${done.has(l.id) ? 'bg-teal-soft' : 'border border-line bg-canvas'}`}>
                      {done.has(l.id) && <Icon name="check" className="h-4 w-4" />}
                    </span>
                    <b className="min-w-0 flex-1">{l.title}</b>
                    <Icon name="arrow" className="h-5 w-5 flex-none text-muted" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">
        Beispielinhalte. Die fachliche Prüfung durch eine Fachkraft steht noch aus.
      </p>
    </div>
  );
}

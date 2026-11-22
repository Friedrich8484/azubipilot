import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { cards, notes, checklists, templates } from '@/lib/materials-static';
import { FREE_UPLOAD_LIMIT } from '@/lib/plans';
import { ChecklistItems, CopyButton } from '@/components/MaterialBits';
import { Uploader, MaterialRow } from '@/components/Uploader';

export const metadata: Metadata = { title: 'Materialien' };

const TABS = [
  ['zettel', 'Lernzettel'],
  ['summ', 'Zusammenfassungen'],
  ['karten', 'Karteikarten'],
  ['checklisten', 'Checklisten'],
  ['vorlagen', 'Vorlagen'],
  ['eigene', 'Meine Dateien'],
] as const;

function groupBy<T extends { module: string }>(xs: T[]) {
  const m = new Map<string, T[]>();
  xs.forEach((x) => m.set(x.module, [...(m.get(x.module) ?? []), x]));
  return [...m.entries()];
}

export default async function MaterialienPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, plan } = await requireUser();
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab! : 'zettel';

  let summaries: { module: string; title: string; summary: string }[] = [];
  if (tab === 'summ') {
    const { data } = await supabase.from('lessons').select('title, summary, position, learning_modules(title, position)');
    type R = { title: string; summary: string; position: number; learning_modules: { title: string; position: number } | { title: string; position: number }[] | null };
    summaries = ((data ?? []) as unknown as R[])
      .map((l) => {
        const m = Array.isArray(l.learning_modules) ? l.learning_modules[0] : l.learning_modules;
        return { module: m?.title ?? '', mp: m?.position ?? 0, p: l.position, title: l.title, summary: l.summary };
      })
      .sort((a, b) => a.mp - b.mp || a.p - b.p);
  }

  let files: { id: string; title: string; topic: string; file_name: string; size_bytes: number; created_at: string }[] = [];
  if (tab === 'eigene') {
    const { data } = await supabase
      .from('user_materials')
      .select('id, title, topic, file_name, size_bytes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    files = data ?? [];
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Lernmaterialien</h1>
        <p className="text-muted">Nach Ausbildungsberuf und Thema sortiert. Beruf: Büromanagement.</p>
      </div>

      <nav className="mb-4 flex gap-1.5 overflow-x-auto pb-0.5" aria-label="Materialarten">
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`/materialien?tab=${k}`}
            aria-current={tab === k ? 'page' : undefined}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
              tab === k ? 'border-navy bg-navy text-white' : 'border-line bg-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === 'zettel' &&
        groupBy(notes).map(([mod, xs]) => (
          <section key={mod} className="mb-5">
            <h2 className="mb-2.5 text-base font-semibold text-muted">{mod}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {xs.map((n) => (
                <div key={n.title} className="card">
                  <h3 className="mb-2.5 text-[17px] font-bold">{n.title}</h3>
                  <ul className="list-disc space-y-1 pl-[18px]">{n.points.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        ))}

      {tab === 'summ' &&
        groupBy(summaries).map(([mod, xs]) => (
          <section key={mod} className="mb-5">
            <h2 className="mb-2.5 text-base font-semibold text-muted">{mod}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {xs.map((s) => (
                <div key={s.title} className="card">
                  <h3 className="mb-2 text-[17px] font-bold">{s.title}</h3>
                  <p className="text-sm text-muted">{s.summary}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

      {tab === 'karten' &&
        groupBy(cards).map(([mod, xs]) => (
          <section key={mod} className="mb-5">
            <h2 className="mb-2.5 text-base font-semibold text-muted">{mod}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {xs.map((c) => (
                <details key={c.front} className="card">
                  <summary className="cursor-pointer font-semibold">{c.front}</summary>
                  <p className="mt-3 border-t border-dashed border-line pt-3 text-muted">{c.back}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

      {tab === 'checklisten' && (
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((c) => (
            <div key={c.title} className="card">
              <h3 className="mb-2 text-[17px] font-bold">{c.title}</h3>
              <ChecklistItems id={c.title} items={c.items} />
            </div>
          ))}
        </div>
      )}

      {tab === 'vorlagen' && (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <div key={t.title} className="card">
              <h3 className="mb-2.5 text-[17px] font-bold">{t.title}</h3>
              <pre className="mb-3.5 whitespace-pre-wrap font-sans text-sm text-muted">{t.text}</pre>
              <CopyButton text={t.text} />
            </div>
          ))}
        </div>
      )}

      {tab === 'eigene' && (
        <div className="grid gap-4">
          <Uploader userId={user.id} count={files.length} limit={plan === 'free' ? FREE_UPLOAD_LIMIT : null} />
          <div className="card">
            <h2 className="mb-2 text-lg font-bold">Meine Dateien</h2>
            {files.length === 0 ? (
              <p className="text-sm text-muted">Noch nichts hochgeladen. Erlaubt sind PDF, PNG, JPG und TXT bis 10 MB.</p>
            ) : (
              <div className="divide-y divide-line">
                {files.map((f) => <MaterialRow key={f.id} file={f} />)}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-muted">Beispielinhalte. Die fachliche Prüfung steht aus.</p>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { DoneButton } from '@/components/DoneButton';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Lektion' };

type Check = { q: string; a: string };

export default async function LektionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, user } = await requireUser();

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, goal, explanation, examples, summary, check_questions, position, module_id, learning_modules(title, position)')
    .eq('id', id)
    .maybeSingle();
  if (!lesson) notFound();

  const mod = Array.isArray(lesson.learning_modules) ? lesson.learning_modules[0] : lesson.learning_modules;

  const [{ data: prog }, { data: all }] = await Promise.all([
    supabase.from('learning_progress').select('lesson_id').eq('user_id', user.id).eq('lesson_id', lesson.id).maybeSingle(),
    supabase.from('lessons').select('id, position, learning_modules(position)'),
  ]);

  type A = { id: string; position: number; learning_modules: { position: number } | { position: number }[] | null };
  const ordered = ((all ?? []) as unknown as A[])
    .map((l) => ({ id: l.id, mp: (Array.isArray(l.learning_modules) ? l.learning_modules[0]?.position : l.learning_modules?.position) ?? 0, p: l.position }))
    .sort((a, b) => a.mp - b.mp || a.p - b.p);
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const next = ordered[idx + 1];

  const checks = (lesson.check_questions ?? []) as Check[];

  return (
    <div>
      <Link href="/lernen" className="text-sm text-brand-dark underline">← Zurück zur Übersicht</Link>
      <div className="mb-5 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="pill">{mod?.title}</span>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
        </div>
        <DoneButton lessonId={lesson.id} done={!!prog} />
      </div>

      <article className="card prose-lesson">
        <div className="notice mb-5"><b>Lernziel:</b> {lesson.goal}</div>

        <h2 className="mb-2 text-lg font-bold">Erklärung</h2>
        {(lesson.explanation as string[]).map((p, i) => <p key={i}>{p}</p>)}

        <h2 className="mb-2 mt-6 text-lg font-bold">Beispiele aus der Praxis</h2>
        <ul className="mb-3 max-w-[68ch] list-disc space-y-1.5 pl-5">
          {(lesson.examples as string[]).map((e, i) => <li key={i}>{e}</li>)}
        </ul>

        <h2 className="mb-2 mt-6 text-lg font-bold">Zusammenfassung</h2>
        <p>{lesson.summary}</p>

        <h2 className="mb-2 mt-6 text-lg font-bold">Verständnisfragen</h2>
        {checks.map((c, i) => (
          <details key={i} className="mb-2.5 rounded-xl border border-line p-3.5">
            <summary className="cursor-pointer font-semibold">{c.q}</summary>
            <p className="mt-3 border-t border-dashed border-line pt-3 text-muted">{c.a}</p>
          </details>
        ))}
      </article>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/quiz" className="btn btn-secondary">Quiz zum Thema</Link>
        {next && (
          <Link href={`/lernen/${next.id}`} className="btn btn-primary">
            Nächste Lektion <Icon name="arrow" />
          </Link>
        )}
      </div>
    </div>
  );
}

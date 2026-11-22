import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';

export const metadata: Metadata = { title: 'Quiz' };

type Q = { id: string; title: string; quiz_questions: { id: string }[]; learning_modules: { position: number } | { position: number }[] | null };

export default async function QuizPage() {
  const { supabase, user } = await requireUser();
  const [{ data: quizzes }, { data: results }] = await Promise.all([
    supabase.from('quizzes').select('id, title, quiz_questions(id), learning_modules(position)'),
    supabase.from('quiz_results').select('quiz_id, score, points').eq('user_id', user.id),
  ]);

  const list = ((quizzes ?? []) as unknown as Q[]).sort((a, b) => {
    const pa = (Array.isArray(a.learning_modules) ? a.learning_modules[0]?.position : a.learning_modules?.position) ?? 0;
    const pb = (Array.isArray(b.learning_modules) ? b.learning_modules[0]?.position : b.learning_modules?.position) ?? 0;
    return pa - pb;
  });
  const best = new Map<string, number>();
  let points = 0;
  (results ?? []).forEach((r) => {
    points += r.points ?? 0;
    best.set(r.quiz_id, Math.max(best.get(r.quiz_id) ?? 0, r.score));
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Quiz</h1>
          <p className="text-muted">Multiple Choice mit sofortigem Feedback.</p>
        </div>
        <div className="card px-4 py-3">
          <span className="text-sm text-muted">Punkte gesamt</span>{' '}
          <b className="text-2xl font-extrabold tabular-nums">{points}</b>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((q) => {
          const n = q.quiz_questions.length;
          const b = best.get(q.id);
          return (
            <div key={q.id} className="card">
              <h2 className="text-lg font-bold">{q.title}</h2>
              <p className="mb-3.5 mt-1.5 text-sm text-muted">
                {n} Fragen{b != null ? `, Bestwert ${b} von ${n}` : ''}
              </p>
              <Link href={`/quiz/${q.id}`} className="btn btn-primary">Starten</Link>
            </div>
          );
        })}
        {list.length === 0 && <div className="card text-muted">Noch keine Quizze vorhanden.</div>}
      </div>
      <p className="mt-4 text-xs text-muted">
        Beispielfragen. Die fachliche Prüfung steht aus. Es sind keine offiziellen Prüfungsfragen.
      </p>
    </div>
  );
}

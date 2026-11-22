import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { addDays, daysBetween, formatDate, parseDate, toDateString, todayString } from '@/lib/dates';
import { Ring } from '@/components/Ring';
import { Icon } from '@/components/Icon';
import { TaskCheck, GoalCheck } from '@/components/Checks';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();
  const today = todayString();

  const [lessonsRes, progressRes, tasksRes, plansRes, goalsRes, resultsRes] = await Promise.all([
    supabase.from('lessons').select('id, title, position, learning_modules(title, position, training_year)'),
    supabase.from('learning_progress').select('lesson_id, completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }),
    supabase.from('study_tasks').select('id, title, due_date, done').eq('user_id', user.id).order('due_date'),
    supabase.from('study_plans').select('id, title, exam_date').eq('user_id', user.id).gte('exam_date', today).order('exam_date').limit(1),
    supabase.from('learning_goals').select('id, text, done').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('quiz_results').select('points').eq('user_id', user.id),
  ]);

  type L = { id: string; title: string; position: number; learning_modules: { title: string; position: number; training_year: number } | { title: string; position: number; training_year: number }[] | null };
  const lessons = ((lessonsRes.data ?? []) as unknown as L[]).map((l) => {
    const m = Array.isArray(l.learning_modules) ? l.learning_modules[0] : l.learning_modules;
    return { id: l.id, title: l.title, pos: l.position, mod: m?.title ?? '', modPos: m?.position ?? 0 };
  });
  lessons.sort((a, b) => a.modPos - b.modPos || a.pos - b.pos);

  const progress = progressRes.data ?? [];
  const doneIds = new Set(progress.map((p) => p.lesson_id));
  const percent = lessons.length ? Math.round((doneIds.size / lessons.length) * 100) : 0;
  const next = lessons.find((l) => !doneIds.has(l.id));
  const recent = progress.slice(0, 3).map((p) => lessons.find((l) => l.id === p.lesson_id)).filter(Boolean) as typeof lessons;
  const points = (resultsRes.data ?? []).reduce((s, r) => s + (r.points ?? 0), 0);

  const tasks = tasksRes.data ?? [];
  const dueTasks = tasks.filter((t) => !t.done && t.due_date <= today).slice(0, 5);
  const exam = (plansRes.data ?? [])[0];
  const goals = goalsRes.data ?? [];

  const d0 = new Date();
  const monday = new Date(d0);
  monday.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const week = dayNames.map((n, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const s = toDateString(d);
    return {
      n,
      day: d.getDate(),
      s,
      open: tasks.some((t) => t.due_date === s && !t.done),
      exam: exam?.exam_date === s,
    };
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{formatDate(today)}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Hallo{profile.first_name ? `, ${profile.first_name}` : ''}</h1>
        </div>
        <Link href={next ? `/lernen/${next.id}` : '/quiz'} className="btn btn-primary">
          {next ? 'Weiterlernen' : 'Quiz starten'} <Icon name="arrow" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card flex items-center gap-5">
          <Ring percent={percent} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Lernfortschritt</h2>
            <p className="mt-1 text-sm text-muted">
              {doneIds.size} von {lessons.length} Lektionen erledigt
            </p>
            <p className="mt-2.5 text-sm">
              <b className="text-2xl font-extrabold tabular-nums">{points}</b> Quiz-Punkte
            </p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold">Nächste Prüfung</h2>
          {exam ? (
            <>
              <p className="mt-2 text-3xl font-extrabold tabular-nums">
                {Math.max(0, daysBetween(today, exam.exam_date))} <span className="text-sm font-medium text-muted">Tage</span>
              </p>
              <p className="text-sm text-muted">
                {exam.title}, {formatDate(exam.exam_date)}
              </p>
            </>
          ) : (
            <>
              <p className="my-2 text-sm text-muted">Noch kein Termin eingetragen.</p>
              <Link href="/planer" className="btn btn-secondary">Termin eintragen</Link>
            </>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <h2 className="mb-3 text-lg font-bold">Diese Woche</h2>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[13px]">
          {week.map((w) => (
            <div
              key={w.s}
              className={`min-w-0 rounded-[10px] border px-0.5 py-2 ${
                w.s === today ? 'border-brand bg-brand text-white' : w.exam ? 'border-danger text-danger' : 'border-line'
              }`}
            >
              {w.n}
              <b className="block text-[17px] tabular-nums">{w.day}</b>
              {w.open ? <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-teal" /> : w.exam ? <span className="text-[11px]">Prüfung</span> : <>&nbsp;</>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-bold">Heute dran</h2>
          <div className="mt-2 divide-y divide-line">
            {dueTasks.length ? (
              dueTasks.map((t) => <TaskCheck key={t.id} id={t.id} title={t.title} date={t.due_date} done={t.done} />)
            ) : (
              <p className="py-2 text-sm text-muted">
                Keine Aufgaben fällig. {tasks.length === 0 && <>Erstelle im <Link href="/planer" className="text-brand-dark underline">Prüfungsplaner</Link> einen Lernplan.</>}
              </p>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold">Aktuelle Lernziele</h2>
          <div className="mt-2 divide-y divide-line">
            {goals.length ? (
              goals.map((g) => <GoalCheck key={g.id} id={g.id} text={g.text} done={g.done} />)
            ) : (
              <p className="py-2 text-sm text-muted">
                Lege im <Link href="/profil" className="text-brand-dark underline">Profil</Link> deine Lernziele fest.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h2 className="text-lg font-bold">Zuletzt bearbeitet</h2>
        <div className="mt-2 divide-y divide-line">
          {recent.length ? (
            recent.map((l) => (
              <Link key={l.id} href={`/lernen/${l.id}`} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <b>{l.title}</b>
                  <div className="text-xs text-muted">{l.mod}</div>
                </div>
                <span className="pill pill-ok">Erledigt</span>
              </Link>
            ))
          ) : (
            <p className="py-2 text-sm text-muted">
              Noch nichts erledigt. Starte mit einer Lektion unter <Link href="/lernen" className="text-brand-dark underline">Lernen</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

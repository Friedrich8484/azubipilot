import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { addDays, daysBetween, formatDate, todayString } from '@/lib/dates';
import { Bar } from '@/components/Ring';
import { TaskCheck } from '@/components/Checks';
import { PlanForm, DeletePlanButton } from '@/components/PlanForm';

export const metadata: Metadata = { title: 'Prüfungsplaner' };

export default async function PlanerPage() {
  const { supabase, user, profile } = await requireUser();
  const today = todayString();

  const [{ data: plans }, { data: tasks }] = await Promise.all([
    supabase.from('study_plans').select('id, title, exam_date').eq('user_id', user.id).order('exam_date'),
    supabase.from('study_tasks').select('id, title, due_date, done').eq('user_id', user.id).order('due_date'),
  ]);

  const all = tasks ?? [];
  const open = all.filter((t) => !t.done);
  const doneTasks = all.filter((t) => t.done);
  const groups = new Map<string, typeof open>();
  open.forEach((t) => groups.set(t.due_date, [...(groups.get(t.due_date) ?? []), t]));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Prüfungsplaner</h1>
        <p className="text-muted">Termin eintragen, Plan erzeugen, Aufgaben abhaken.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3.5 text-lg font-bold">Neue Prüfung</h2>
          <PlanForm minDate={addDays(today, 1)} defaultMinutes={profile.daily_goal_minutes} />
        </div>
        <div className="card">
          <h2 className="mb-3 text-lg font-bold">Meine Prüfungen</h2>
          {plans && plans.length > 0 ? (
            <div className="divide-y divide-line">
              {plans.map((p) => {
                const d = daysBetween(today, p.exam_date);
                return (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <b>{p.title}</b>
                      <div className="text-sm text-muted">{formatDate(p.exam_date)}</div>
                    </div>
                    <span className={`pill ${d < 0 ? 'pill-grey' : ''}`}>{d < 0 ? 'vorbei' : d === 0 ? 'heute' : `in ${d} Tagen`}</span>
                    <DeletePlanButton id={p.id} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">Noch keine Prüfung. Trage links einen Termin ein.</p>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Lernplan</h2>
          <span className="text-sm text-muted">{doneTasks.length} von {all.length} erledigt</span>
        </div>
        <div className="mb-1 mt-3"><Bar percent={all.length ? (doneTasks.length / all.length) * 100 : 0} /></div>

        {all.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Noch kein Lernplan. Er verteilt offene Lektionen, Quizze und Wiederholungen auf die Tage bis zur Prüfung.
          </p>
        ) : (
          <>
            {[...groups.entries()].map(([date, ts]) => (
              <div key={date} className="mt-4">
                <div className={`text-sm font-bold ${date < today ? 'text-danger' : ''}`}>
                  {formatDate(date)}
                  {date < today ? ' (überfällig)' : date === today ? ' (heute)' : ''}
                </div>
                <div className="divide-y divide-line">
                  {ts.map((t) => <TaskCheck key={t.id} id={t.id} title={t.title} date={t.due_date} done={t.done} />)}
                </div>
              </div>
            ))}
            {doneTasks.length > 0 && (
              <details className="mt-5">
                <summary className="cursor-pointer text-sm text-muted">Erledigte Aufgaben ({doneTasks.length})</summary>
                <div className="divide-y divide-line">
                  {doneTasks.map((t) => <TaskCheck key={t.id} id={t.id} title={t.title} date={t.due_date} done={t.done} />)}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}

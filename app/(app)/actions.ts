'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { addDays, daysBetween, todayString } from '@/lib/dates';

export type FormState = { error?: string; ok?: string } | undefined;

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht angemeldet');
  return { supabase, user };
}

/* ------------------------------------------------------------ Lektionen */
export async function setLessonDone(lessonId: string, done: boolean) {
  const { supabase, user } = await authed();
  if (done) {
    await supabase
      .from('learning_progress')
      .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true });
  } else {
    await supabase.from('learning_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
  }
  revalidatePath('/lernen', 'layout');
  revalidatePath('/dashboard');
}

/* ------------------------------------------------------------ Aufgaben und Ziele */
export async function toggleTask(id: string, done: boolean) {
  const { supabase, user } = await authed();
  await supabase.from('study_tasks').update({ done }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/planer');
  revalidatePath('/dashboard');
}

export async function toggleGoal(id: string, done: boolean) {
  const { supabase, user } = await authed();
  await supabase.from('learning_goals').update({ done }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/profil');
  revalidatePath('/dashboard');
}

export async function addGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const text = String(formData.get('text') ?? '').trim();
  if (!text) return { error: 'Bitte gib ein Lernziel ein.' };
  if (text.length > 200) return { error: 'Das Lernziel darf höchstens 200 Zeichen lang sein.' };
  const { supabase, user } = await authed();
  const { error } = await supabase.from('learning_goals').insert({ user_id: user.id, text });
  if (error) return { error: 'Das Lernziel konnte nicht gespeichert werden.' };
  revalidatePath('/profil');
  revalidatePath('/dashboard');
  return { ok: 'Lernziel hinzugefügt.' };
}

export async function deleteGoal(id: string) {
  const { supabase, user } = await authed();
  await supabase.from('learning_goals').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/profil');
  revalidatePath('/dashboard');
}

/* ------------------------------------------------------------ Profil */
export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get('name') ?? '').trim();
  const year = Number(formData.get('year'));
  const minutes = Number(formData.get('minutes'));
  if (!name) return { error: 'Bitte gib deinen Vornamen ein.' };
  if (![1, 2, 3].includes(year)) return { error: 'Bitte wähle ein Ausbildungsjahr.' };
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 240) return { error: 'Das Tagesziel muss zwischen 5 und 240 Minuten liegen.' };
  const { supabase, user } = await authed();
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: name.slice(0, 60), training_year: year, daily_goal_minutes: Math.round(minutes) })
    .eq('id', user.id);
  if (error) return { error: 'Die Änderungen konnten nicht gespeichert werden.' };
  revalidatePath('/', 'layout');
  return { ok: 'Gespeichert.' };
}

/* ------------------------------------------------------------ Prüfungsplaner */
export async function createPlan(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get('title') ?? '').trim() || 'Prüfung';
  const date = String(formData.get('date') ?? '');
  const minutes = Math.round(Number(formData.get('minutes')) || 30);
  const today = todayString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || daysBetween(today, date) < 1) {
    return { error: 'Bitte wähle ein Datum in der Zukunft.' };
  }
  if (minutes < 5 || minutes > 240) return { error: 'Das Tagesziel muss zwischen 5 und 240 Minuten liegen.' };

  const { supabase, user } = await authed();

  const [{ data: lessons }, { data: done }, { data: modules }] = await Promise.all([
    supabase.from('lessons').select('id, title, position, learning_modules(position)'),
    supabase.from('learning_progress').select('lesson_id').eq('user_id', user.id),
    supabase.from('learning_modules').select('title, position').order('position'),
  ]);

  const doneIds = new Set((done ?? []).map((d) => d.lesson_id));
  type L = { id: string; title: string; position: number; learning_modules: { position: number } | { position: number }[] | null };
  const open = ((lessons ?? []) as unknown as L[])
    .filter((l) => !doneIds.has(l.id))
    .map((l) => ({ title: l.title, mp: (Array.isArray(l.learning_modules) ? l.learning_modules[0]?.position : l.learning_modules?.position) ?? 0, p: l.position }))
    .sort((a, b) => a.mp - b.mp || a.p - b.p);

  const items: string[] = [];
  open.forEach((l) => items.push(`Lektion: ${l.title} (${Math.max(10, Math.min(minutes, 30))} Min.)`));
  (modules ?? []).forEach((m) => items.push(`Quiz: ${m.title}`));
  items.push('Karteikarten wiederholen');

  const days = daysBetween(today, date);
  const span = Math.max(1, days - 1);

  const { data: plan, error } = await supabase
    .from('study_plans')
    .insert({ user_id: user.id, title, exam_date: date, daily_minutes: minutes })
    .select('id')
    .single();
  if (error || !plan) return { error: 'Der Lernplan konnte nicht gespeichert werden.' };

  const rows = items.map((t, i) => ({
    plan_id: plan.id,
    user_id: user.id,
    title: t,
    due_date: addDays(today, Math.floor((i * span) / items.length)),
  }));
  rows.push({
    plan_id: plan.id,
    user_id: user.id,
    title: 'Lernzettel durchgehen und früh schlafen gehen',
    due_date: addDays(today, days - 1),
  });

  const { error: tErr } = await supabase.from('study_tasks').insert(rows);
  if (tErr) {
    await supabase.from('study_plans').delete().eq('id', plan.id).eq('user_id', user.id);
    return { error: 'Die Aufgaben konnten nicht gespeichert werden.' };
  }
  revalidatePath('/planer');
  revalidatePath('/dashboard');
  return { ok: `Lernplan mit ${rows.length} Aufgaben erstellt.` };
}

export async function deletePlan(id: string) {
  const { supabase, user } = await authed();
  await supabase.from('study_plans').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/planer');
  revalidatePath('/dashboard');
}

/* ------------------------------------------------------------ Quiz */
export async function submitQuiz(quizId: string, answers: number[]) {
  const { supabase } = await authed();
  const { data, error } = await supabase.rpc('submit_quiz', { p_quiz_id: quizId, p_answers: answers });
  if (error) return { error: 'Das Ergebnis konnte nicht gespeichert werden.' as const };
  const row = Array.isArray(data) ? data[0] : data;
  revalidatePath('/quiz');
  revalidatePath('/dashboard');
  return { score: row.score as number, total: row.total as number, points: row.points as number };
}

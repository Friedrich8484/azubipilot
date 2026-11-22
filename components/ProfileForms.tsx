'use client';

import { useActionState, useRef, useEffect, useTransition } from 'react';
import { saveProfile, addGoal, deleteGoal, toggleGoal } from '@/app/(app)/actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Icon } from '@/components/Icon';

export function ProfileForm({ name, email, year, minutes }: { name: string; email: string; year: number; minutes: number }) {
  const [state, action] = useActionState(saveProfile, undefined);
  return (
    <form action={action} noValidate>
      <div className="mb-3.5">
        <label htmlFor="name" className="label">Vorname</label>
        <input id="name" name="name" defaultValue={name} maxLength={60} className="input" />
      </div>
      <div className="mb-3.5">
        <label htmlFor="email" className="label">E-Mail</label>
        <input id="email" value={email} readOnly className="input bg-canvas text-muted" />
      </div>
      <div className="mb-3.5">
        <label htmlFor="prog" className="label">Ausbildungsberuf</label>
        <select id="prog" className="input" defaultValue="bm">
          <option value="bm">Kaufmann/-frau für Büromanagement</option>
          <option disabled>Weitere Berufe, in Planung</option>
        </select>
      </div>
      <div className="mb-3.5">
        <label htmlFor="year" className="label">Ausbildungsjahr</label>
        <select id="year" name="year" defaultValue={String(year)} className="input">
          <option value="1">1. Ausbildungsjahr</option>
          <option value="2">2. Ausbildungsjahr</option>
          <option value="3">3. Ausbildungsjahr</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="minutes" className="label">Lernziel pro Tag (Minuten)</label>
        <input id="minutes" name="minutes" type="number" min={5} max={240} step={5} defaultValue={minutes} className="input" />
      </div>
      <div aria-live="polite">
        {state?.error && <p role="alert" className="mb-3 text-sm text-danger">{state.error}</p>}
        {state?.ok && <p role="status" className="mb-3 text-sm text-ok">{state.ok}</p>}
      </div>
      <SubmitButton pendingText="Wird gespeichert…">Speichern</SubmitButton>
    </form>
  );
}

export function GoalForm() {
  const [state, action] = useActionState(addGoal, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} noValidate>
      <div className="flex gap-2">
        <input name="text" maxLength={200} placeholder="z. B. Alle Lektionen bis Freitag" aria-label="Neues Lernziel" className="input" />
        <SubmitButton className="btn btn-secondary" pendingText="…">Hinzufügen</SubmitButton>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-sm text-danger">{state.error}</p>}
    </form>
  );
}

export function GoalRow({ id, text, done }: { id: string; text: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={`flex items-center gap-2.5 py-3 ${pending ? 'opacity-60' : ''}`}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          defaultChecked={done}
          onChange={(e) => start(() => toggleGoal(id, e.target.checked))}
          className="mt-1 h-[18px] w-[18px] flex-none accent-brand"
        />
        <span className={`min-w-0 flex-1 ${done ? 'text-muted line-through' : ''}`}>{text}</span>
      </label>
      <button className="btn btn-ghost" aria-label="Lernziel löschen" disabled={pending} onClick={() => start(() => deleteGoal(id))}>
        <Icon name="trash" />
      </button>
    </div>
  );
}

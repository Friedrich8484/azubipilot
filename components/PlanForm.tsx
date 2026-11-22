'use client';

import { useActionState, useTransition } from 'react';
import { createPlan, deletePlan } from '@/app/(app)/actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Icon } from '@/components/Icon';

export function PlanForm({ minDate, defaultMinutes }: { minDate: string; defaultMinutes: number }) {
  const [state, action] = useActionState(createPlan, undefined);
  return (
    <form action={action} noValidate>
      <div className="mb-3.5">
        <label htmlFor="title" className="label">Bezeichnung</label>
        <input id="title" name="title" type="text" defaultValue="Abschlussprüfung Teil 1" maxLength={80} className="input" />
      </div>
      <div className="mb-3.5">
        <label htmlFor="date" className="label">Prüfungsdatum</label>
        <input id="date" name="date" type="date" min={minDate} className="input" required />
      </div>
      <div className="mb-3.5">
        <label htmlFor="minutes" className="label">Lernziel pro Tag (Minuten)</label>
        <input id="minutes" name="minutes" type="number" min={5} max={240} step={5} defaultValue={defaultMinutes} className="input" />
      </div>
      <div aria-live="polite">
        {state?.error && <p role="alert" className="mb-3 text-sm text-danger">{state.error}</p>}
        {state?.ok && <p role="status" className="mb-3 text-sm text-ok">{state.ok}</p>}
      </div>
      <SubmitButton pendingText="Plan wird erstellt…">Lernplan erstellen</SubmitButton>
    </form>
  );
}

export function DeletePlanButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-ghost"
      disabled={pending}
      aria-label="Prüfung und Lernplan löschen"
      onClick={() => start(() => deletePlan(id))}
    >
      <Icon name="trash" />
    </button>
  );
}

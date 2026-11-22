'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { login, register, type AuthState } from '@/app/auth/actions';
import { SubmitButton } from '@/components/SubmitButton';

function Messages({ state }: { state: AuthState }) {
  return (
    <div aria-live="polite">
      {state?.error && (
        <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.info && (
        <p role="status" className="mb-4 rounded-xl bg-ok-soft px-4 py-3 text-sm text-ok">
          {state.info}
        </p>
      )}
    </div>
  );
}

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} noValidate>
      {notice && <p className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{notice}</p>}
      <Messages state={state} />
      <div className="mb-3.5">
        <label htmlFor="email" className="label">E-Mail</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" required />
      </div>
      <div className="mb-5">
        <label htmlFor="password" className="label">Passwort</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="input" required />
      </div>
      <SubmitButton className="btn btn-primary w-full" pendingText="Anmelden…">Anmelden</SubmitButton>
      <p className="mt-5 text-center text-sm text-muted">
        Noch kein Konto?{' '}
        <Link href="/registrieren" className="font-semibold text-brand-dark underline">Kostenlos registrieren</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  return (
    <form action={action} noValidate>
      <Messages state={state} />
      <div className="mb-3.5">
        <label htmlFor="name" className="label">Vorname</label>
        <input id="name" name="name" type="text" autoComplete="given-name" maxLength={60} className="input" required />
      </div>
      <div className="mb-3.5">
        <label htmlFor="email" className="label">E-Mail</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" required />
      </div>
      <div className="mb-3.5">
        <label htmlFor="password" className="label">Passwort (mindestens 8 Zeichen)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="input" required />
      </div>
      <div className="mb-4">
        <label htmlFor="year" className="label">Ausbildungsjahr</label>
        <select id="year" name="year" className="input" defaultValue="1">
          <option value="1">1. Ausbildungsjahr</option>
          <option value="2">2. Ausbildungsjahr</option>
          <option value="3">3. Ausbildungsjahr</option>
        </select>
      </div>
      <label className="mb-5 flex items-start gap-2.5 text-sm font-normal">
        <input type="checkbox" name="consent" className="mt-1 h-[18px] w-[18px] flex-none accent-brand" />
        <span>
          Ich habe die <Link href="/datenschutz" className="text-brand-dark underline">Datenschutzhinweise</Link> gelesen.
        </span>
      </label>
      <SubmitButton className="btn btn-primary w-full" pendingText="Konto wird angelegt…">Konto anlegen</SubmitButton>
      <p className="mt-5 text-center text-sm text-muted">
        Schon registriert?{' '}
        <Link href="/login" className="font-semibold text-brand-dark underline">Anmelden</Link>
      </p>
    </form>
  );
}

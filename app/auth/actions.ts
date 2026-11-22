'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; info?: string } | undefined;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!EMAIL_RE.test(email)) return { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
  if (!password) return { error: 'Bitte gib dein Passwort ein.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Bitte bestätige zuerst deine E-Mail-Adresse. Den Link findest du in deinem Postfach.' };
    }
    return { error: 'E-Mail oder Passwort stimmt nicht.' };
  }
  redirect('/dashboard');
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const year = String(formData.get('year') ?? '1');
  const consent = formData.get('consent') === 'on';

  if (!name) return { error: 'Bitte gib deinen Vornamen ein.' };
  if (!EMAIL_RE.test(email)) return { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
  if (password.length < 8) return { error: 'Das Passwort braucht mindestens 8 Zeichen.' };
  if (!['1', '2', '3'].includes(year)) return { error: 'Bitte wähle ein Ausbildungsjahr.' };
  if (!consent) return { error: 'Bitte bestätige die Datenschutzhinweise.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: name.slice(0, 60), training_year: year },
      emailRedirectTo: `${await siteUrl()}/auth/callback`,
    },
  });
  if (error) {
    return { error: 'Die Registrierung hat nicht geklappt. Prüfe deine Angaben oder versuche es später noch einmal.' };
  }
  if (data.session) redirect('/dashboard');
  return { info: 'Fast geschafft. Wir haben dir eine E-Mail geschickt. Klicke auf den Link darin, um dein Konto zu bestätigen.' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

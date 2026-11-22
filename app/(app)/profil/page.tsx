import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { PLANS } from '@/lib/plans';
import { ProfileForm, GoalForm, GoalRow } from '@/components/ProfileForms';
import { logout } from '@/app/auth/actions';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Profil' };

export default async function ProfilPage() {
  const { supabase, user, profile, plan } = await requireUser();
  const { data: goals } = await supabase
    .from('learning_goals')
    .select('id, text, done')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const p = PLANS.find((x) => x.id === plan)!;

  return (
    <div>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">Profil und Einstellungen</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3.5 text-lg font-bold">Persönliche Angaben</h2>
          <ProfileForm name={profile.first_name} email={user.email ?? ''} year={profile.training_year} minutes={profile.daily_goal_minutes} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="mb-2.5 text-lg font-bold">Lernziele</h2>
            <GoalForm />
            <div className="mt-2 divide-y divide-line">
              {(goals ?? []).map((g) => <GoalRow key={g.id} id={g.id} text={g.text} done={g.done} />)}
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-bold">Abonnement</h2>
            <p className="my-2">
              <b>{p.name}</b>{' '}
              <span className="text-sm text-muted">{p.id === 'free' ? '' : `${p.price} ${p.note}`}</span>
            </p>
            <Link href="/preise" className="btn btn-secondary">Pläne ansehen</Link>
          </div>
          <div className="card">
            <h2 className="mb-2.5 text-lg font-bold">Konto</h2>
            <form action={logout}>
              <button className="btn btn-secondary"><Icon name="out" className="h-4 w-4" /> Abmelden</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

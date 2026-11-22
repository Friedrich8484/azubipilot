import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PlanId } from '@/lib/plans';

export type Profile = {
  id: string;
  first_name: string;
  training_year: number;
  daily_goal_minutes: number;
};

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, training_year, daily_goal_minutes').eq('id', user.id).maybeSingle(),
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).maybeSingle(),
  ]);

  return {
    supabase,
    user,
    profile: (profile ?? { id: user.id, first_name: '', training_year: 1, daily_goal_minutes: 30 }) as Profile,
    plan: ((sub?.plan as PlanId | undefined) ?? 'free') as PlanId,
  };
}

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { PricingCards } from '@/components/PricingCards';
import type { PlanId } from '@/lib/plans';

export const metadata: Metadata = { title: 'Preise' };

export default async function PreisePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let plan: PlanId = 'free';
  if (user) {
    const { data } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).maybeSingle();
    if (data?.plan) plan = data.plan as PlanId;
  }

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 pt-14">
        <p className="eyebrow">Preise</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Transparent und ohne Überraschungen</h1>
        <p className="mt-3 max-w-xl text-muted">
          Alle Preise gelten pro Monat inklusive der gesetzlichen Umsatzsteuer. Ein Abo wird nur nach deiner
          ausdrücklichen Zustimmung abgeschlossen.
        </p>
        <div className="mt-8">
          <PricingCards currentPlan={plan} loggedIn={!!user} />
        </div>
        <p className="mt-4 text-xs text-muted">
          Die Bezahlung für Premium und Ultimate ist noch nicht freigeschaltet. Der kostenlose Plan ist sofort
          nutzbar.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}

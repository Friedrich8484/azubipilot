import Link from 'next/link';
import { PLANS, type PlanId } from '@/lib/plans';
import { Icon } from '@/components/Icon';

export function PricingCards({
  currentPlan,
  loggedIn,
}: {
  currentPlan?: PlanId;
  loggedIn: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((p) => {
        const isCurrent = loggedIn && currentPlan === p.id;
        return (
          <div
            key={p.id}
            className={`card flex flex-col gap-4 ${p.highlight ? 'border-2 border-brand' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold">{p.name}</h3>
              {isCurrent ? <span className="pill pill-ok">Dein Plan</span> : p.highlight ? <span className="pill">Beliebt</span> : null}
            </div>
            <div>
              <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>{' '}
              <span className="text-sm text-muted">{p.note}</span>
            </div>
            <ul className="flex flex-col gap-2 text-[14.5px]">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 flex-none text-ok" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {p.id === 'free' ? (
                <Link href={loggedIn ? '/dashboard' : '/registrieren'} className="btn btn-secondary w-full">
                  {loggedIn ? 'Zum Dashboard' : 'Kostenlos starten'}
                </Link>
              ) : (
                <button className="btn btn-secondary w-full" disabled title="Die Bezahlung ist noch nicht freigeschaltet">
                  Bald verfügbar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

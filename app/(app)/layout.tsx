import { requireUser } from '@/lib/session';
import { planName } from '@/lib/plans';
import { AppNav } from '@/components/AppNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, plan } = await requireUser();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <AppNav name={profile.first_name} planLabel={planName(plan)} />
      <main className="min-w-0 px-4 pb-16 pt-6 md:pt-7">
        <div className="mx-auto max-w-[1040px]">{children}</div>
      </main>
    </div>
  );
}

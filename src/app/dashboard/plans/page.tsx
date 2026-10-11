import { PlansClient } from './PlansClient';
import { getPlansAdmin } from '@/app/actions/plans';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PlansPage() {
  const auth = await verifySession();
  if (auth?.session?.role !== 'owner') {
    redirect('/dashboard/reception');
  }

  const plans = await getPlansAdmin();

  return (
    <div className="w-full">
      <PlansClient initialPlans={plans} />
    </div>
  );
}

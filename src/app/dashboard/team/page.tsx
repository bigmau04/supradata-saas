import { TeamClient } from './TeamClient';
import { getTeamMembers } from '@/app/actions/team';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
  const auth = await verifySession();
  if (auth?.session?.role !== 'owner') {
    redirect('/dashboard/reception');
  }

  const members = await getTeamMembers();

  return (
    <div className="w-full">
      <TeamClient initialMembers={members} />
    </div>
  );
}

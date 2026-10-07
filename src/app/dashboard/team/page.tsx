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
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Equipo y Personal</h1>
        <TeamClient initialMembers={members} />
      </div>
    </div>
  );
}

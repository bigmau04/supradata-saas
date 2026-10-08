import { getMembers, getPlans, getCoachesForMembers } from '@/app/actions/members';
import { MembersClient } from './MembersClient';

export default async function MembersPage() {
  const [membersData, plansData, coachesData] = await Promise.all([
    getMembers(),
    getPlans(),
    getCoachesForMembers(),
  ]);
  
  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion de Miembros</h1>
      <MembersClient initialMembers={membersData} plans={plansData} coaches={coachesData} />
    </div>
  );
}


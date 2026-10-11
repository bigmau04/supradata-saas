import { getMembers, getPlans, getCoachesForMembers } from '@/app/actions/members';
import { MembersClient } from './MembersClient';

export default async function MembersPage() {
  const [membersData, plansData, coachesData] = await Promise.all([
    getMembers(),
    getPlans(),
    getCoachesForMembers(),
  ]);

  return (
    <div className="w-full">
      <MembersClient initialMembers={membersData} plans={plansData} coaches={coachesData} />
    </div>
  );
}

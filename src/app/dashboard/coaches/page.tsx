import { getCoaches } from '@/app/actions/coaches';
import { CoachesClient } from './CoachesClient';

export default async function CoachesPage() {
  const coachesData = await getCoaches();
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12">
      <CoachesClient initialCoaches={coachesData} />
    </div>
  );
}

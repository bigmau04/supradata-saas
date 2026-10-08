import { getCoaches } from '@/app/actions/coaches';
import { CoachesClient } from './CoachesClient';

export default async function CoachesPage() {
  let coachesData: any[] = [];
  try {
    coachesData = await getCoaches();
  } catch (error) {
    console.error("Error cargando coaches en page.tsx:", error);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12">
      <CoachesClient initialCoaches={coachesData} />
    </div>
  );
}

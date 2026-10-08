import { getCoaches } from '@/app/actions/coaches';
import { CoachPortalClient } from './CoachPortalClient';

export default async function CoachPortalPage() {
  const coaches = await getCoaches();

  return <CoachPortalClient initialCoaches={coaches} />;
}

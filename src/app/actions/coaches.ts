'use server'

import { db } from '@/db';
import { coaches } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCoaches() {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  return await db.select().from(coaches).where(eq(coaches.gymId, auth.session.gymId));
}

export async function createCoach(formData: FormData) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const fullName = formData.get('fullName') as string;
  const documentId = formData.get('documentId') as string;
  const phone = formData.get('phone') as string;
  const specialty = formData.get('specialty') as string;
  const scheduleDetails = formData.get('scheduleDetails') as string;

  await db.insert(coaches).values({
    gymId: auth.session.gymId,
    fullName,
    documentId,
    phone,
    specialty,
    scheduleDetails
  });

  revalidatePath('/dashboard/coaches');
}

export async function toggleCoachStatus(coachId: string, currentStatus: boolean) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  await db.update(coaches)
    .set({ isActive: !currentStatus })
    .where(and(eq(coaches.id, coachId), eq(coaches.gymId, auth.session.gymId)));

  revalidatePath('/dashboard/coaches');
}

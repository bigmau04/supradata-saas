'use server'

import { db } from '@/db';
import { coaches, members, memberSubscriptions, attendances } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCoaches() {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return await db.select({
    id: coaches.id,
    fullName: coaches.fullName,
    documentId: coaches.documentId,
    phone: coaches.phone,
    specialty: coaches.specialty,
    scheduleDetails: coaches.scheduleDetails,
    isActive: coaches.isActive,
    isClockedIn: coaches.isClockedIn,
    lastClockIn: coaches.lastClockIn,
    lastClockOut: coaches.lastClockOut,
    assignedStudents: sql<number>`COALESCE((
      SELECT COUNT(DISTINCT m.id) 
      FROM ${members} m
      JOIN ${memberSubscriptions} ms ON ms.member_id = m.id
      WHERE m.coach_id = ${coaches.id} 
        AND ms.status = 'active' 
        AND ms.end_date >= CURRENT_DATE
    ), 0)`.mapWith(Number),
    inRoomStudents: sql<number>`COALESCE((
      SELECT COUNT(DISTINCT m.id) 
      FROM ${members} m
      JOIN ${attendances} a ON a.member_id = m.id
      WHERE m.coach_id = ${coaches.id} 
        AND a.check_in >= ${twoHoursAgo.toISOString()}
        AND a.check_out IS NULL
    ), 0)`.mapWith(Number)
  }).from(coaches).where(eq(coaches.gymId, auth.session.gymId));
}

export async function createCoach(formData: FormData) {
  try {
    const payload = Object.fromEntries(formData.entries());
    console.log("Iniciando createCoach con payload:", payload);

    const auth = await verifySession();
    if (!auth || !auth.session?.gymId) throw new Error('No se encontró el identificador del gimnasio');

    const fullName = formData.get('fullName') as string;
    const documentId = formData.get('documentId') as string;
    const phone = formData.get('phone') as string;
    const specialty = formData.get('specialty') as string;
    const scheduleDetails = formData.get('scheduleDetails') as string;

    const inserted = await db.insert(coaches).values({
      fullName,
      documentId,
      phone,
      specialty,
      scheduleDetails,
      gymId: auth.session.gymId,
      isActive: true,
      isClockedIn: false
    }).returning();

    revalidatePath('/dashboard/coaches');
    return { success: true, data: inserted[0] };
  } catch (err: any) {
    console.error("Error exacto en createCoach:", err);
    return { success: false, error: err.message || "Error al insertar en la base de datos" };
  }
}

export async function toggleCoachStatus(coachId: string, currentStatus: boolean) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  await db.update(coaches)
    .set({ isActive: !currentStatus })
    .where(and(eq(coaches.id, coachId), eq(coaches.gymId, auth.session.gymId)));

  revalidatePath('/dashboard/coaches');
}

export async function updateCoach(formData: FormData) {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const id = formData.get('id') as string;
    const phone = formData.get('phone') as string;
    const specialty = formData.get('specialty') as string;
    const scheduleDetails = formData.get('scheduleDetails') as string;

    await db.update(coaches)
      .set({ phone, specialty, scheduleDetails })
      .where(and(eq(coaches.id, id), eq(coaches.gymId, auth.session.gymId)));

    revalidatePath('/dashboard/coaches');
    return { success: true };
  } catch (err: any) {
    console.error('[updateCoach]', err);
    return { success: false, error: err.message };
  }
}

export async function toggleCoachShift(coachId: string) {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const [coach] = await db.select().from(coaches).where(and(eq(coaches.id, coachId), eq(coaches.gymId, auth.session.gymId)));
    if (!coach) throw new Error('Entrenador no encontrado');

    const now = new Date();
    const newStatus = !coach.isClockedIn;

    await db.update(coaches).set({
      isClockedIn: newStatus,
      lastClockIn: newStatus ? now : coach.lastClockIn,
      lastClockOut: !newStatus ? now : coach.lastClockOut,
    }).where(eq(coaches.id, coachId));

    revalidatePath('/dashboard/coach');
    revalidatePath('/dashboard/coaches');
    return { success: true, isClockedIn: newStatus };
  } catch (error: any) {
    console.error('[toggleCoachShift]', error);
    return { success: false, error: error.message };
  }
}

export async function getCoachPortalData(coachId: string) {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const [coach] = await db.select().from(coaches).where(and(eq(coaches.id, coachId), eq(coaches.gymId, auth.session.gymId)));
    if (!coach) return { success: false, error: 'No encontrado' };

    const assignedMembers = await db.select({
      id: members.id,
      fullName: members.fullName,
      phone: members.phone,
      photoUrl: members.photoUrl,
      isInRoom: sql<boolean>`EXISTS (
        SELECT 1 FROM ${attendances} a 
        WHERE a.member_id = ${members.id} 
          AND a.check_in >= ${twoHoursAgo.toISOString()} 
          AND a.check_out IS NULL
      )`.mapWith(Boolean)
    })
    .from(members)
    .where(eq(members.coachId, coachId));

    return { success: true, data: { coach, assignedMembers } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

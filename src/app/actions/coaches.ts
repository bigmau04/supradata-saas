'use server'

import { db } from '@/db';
import { coaches, members, attendances } from '@/db/schema';
import { eq, and, gte, isNotNull, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCoaches(activeOnly?: boolean) {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const conditions = [eq(coaches.gymId, auth.session.gymId)];
    if (typeof activeOnly === 'boolean') {
      conditions.push(eq(coaches.isActive, activeOnly));
    }

    // Paso A: Consulta base de entrenadores
    const coachList = await db
      .select()
      .from(coaches)
      .where(and(...conditions));

    console.log("Coaches encontrados:", coachList.length);

    if (coachList.length === 0) {
      return [];
    }

    // Paso B: Conteo seguro de socios asignados y en sala
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const gymMembers = await db
      .select({ id: members.id, coachId: members.coachId })
      .from(members)
      .where(and(eq(members.gymId, auth.session.gymId), isNotNull(members.coachId)));

    const recentAttendances = await db
      .select({ memberId: attendances.memberId })
      .from(attendances)
      .where(and(eq(attendances.gymId, auth.session.gymId), gte(attendances.checkIn, twoHoursAgo)));

    const recentMemberIdsSet = new Set(recentAttendances.map(a => a.memberId));

    // Mapear contadores por cada entrenador
    return coachList.map(coach => {
      const coachMembers = gymMembers.filter(m => m.coachId === coach.id);
      const assignedCount = coachMembers.length;
      const inGymCount = coachMembers.filter(m => recentMemberIdsSet.has(m.id)).length;

      return {
        ...coach,
        assignedCount,
        assignedStudents: assignedCount,
        inGymCount,
        inRoomStudents: inGymCount
      };
    });
  } catch (error) {
    console.error("Error en getCoaches:", error);
    throw error;
  }
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
    })
    .from(members)
    .where(eq(members.coachId, coachId));

    const recentAttendances = await db.select({
      memberId: attendances.memberId
    })
    .from(attendances)
    .where(and(
      eq(attendances.gymId, auth.session.gymId),
      gte(attendances.checkIn, twoHoursAgo)
    ));

    const inRoomSet = new Set(recentAttendances.map(a => a.memberId));
    const dataWithInRoom = assignedMembers.map(m => ({
      ...m,
      isInRoom: inRoomSet.has(m.id)
    }));

    return { success: true, data: { coach, assignedMembers: dataWithInRoom } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

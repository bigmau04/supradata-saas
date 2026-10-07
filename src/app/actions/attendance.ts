'use server'

import { db } from '@/db';
import { members, memberSubscriptions, attendances, branches } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type AttendanceResult = {
  success: boolean;
  member?: {
    fullName: string;
    documentId: string;
    photoUrl: string | null;
  };
  message: string;
};

export async function registerAttendance(query: string, method: 'qr_scan' | 'manual_doc'): Promise<AttendanceResult> {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  // Buscar el miembro por cédula o código QR asegurando el gym_id
  const [memberData] = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      documentId: members.documentId,
      photoUrl: members.photoUrl,
      status: memberSubscriptions.status,
      endDate: memberSubscriptions.endDate,
    })
    .from(members)
    .leftJoin(
      memberSubscriptions,
      and(
        eq(memberSubscriptions.memberId, members.id),
        eq(memberSubscriptions.status, 'active')
      )
    )
    .where(
      and(
        eq(members.gymId, auth.session.gymId),
        or(
          eq(members.documentId, query),
          eq(members.qrAccessToken, query)
        )
      )
    )
    .limit(1);

  if (!memberData) {
    return { success: false, message: 'Usuario no encontrado' };
  }

  // Verificar si la fecha de finalización es mayor o igual a hoy
  const isActive = memberData.status === 'active' && memberData.endDate && new Date(memberData.endDate) >= new Date(new Date().setHours(0,0,0,0));

  if (!isActive) {
    return { 
      success: false, 
      member: { fullName: memberData.fullName, documentId: memberData.documentId, photoUrl: memberData.photoUrl },
      message: 'Membresía Vencida o Inactiva' 
    };
  }

  // Registrar asistencia
  const [branch] = await db.select().from(branches).where(eq(branches.gymId, auth.session.gymId)).limit(1);

  if (branch) {
    await db.insert(attendances).values({
      gymId: auth.session.gymId,
      branchId: branch.id,
      memberId: memberData.id,
      method: method
    });
  }

  // Refrescar vistas en caso de que haya estadísticas en vivo
  revalidatePath('/dashboard');

  return {
    success: true,
    member: { fullName: memberData.fullName, documentId: memberData.documentId, photoUrl: memberData.photoUrl },
    message: 'Acceso Permitido'
  };
}

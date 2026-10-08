'use server'

import { db } from '@/db';
import { members, memberSubscriptions, attendances, branches } from '@/db/schema';
import { eq, or, and, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type AttendanceResult = {
  success: boolean;
  antiPassbackViolation?: boolean;
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

  let baseQuery = query;
  if (method === 'qr_scan' && query.includes('-')) {
    const parts = query.split('-');
    const timestampPart = parts.pop();
    baseQuery = parts.join('-');
    const currentWindow = Math.floor(Date.now() / 45000);
    const scannedWindow = parseInt(timestampPart || '0', 10);
    
    if (scannedWindow < currentWindow - 1 || scannedWindow > currentWindow + 1) {
       return { success: false, message: 'Código QR Expirado o Inválido. Por favor actualice el carnet digital.' };
    }
  }

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
          eq(members.documentId, baseQuery),
          eq(members.qrAccessToken, baseQuery)
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

  // Anti-passback validation
  const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
  const [recentAttendance] = await db
    .select()
    .from(attendances)
    .where(
      and(
        eq(attendances.memberId, memberData.id),
        sql`${attendances.checkIn} >= ${twoHoursAgo.toISOString()}`,
        sql`${attendances.checkOut} IS NULL`
      )
    )
    .limit(1);

  if (recentAttendance) {
    const diffMs = Date.now() - new Date(recentAttendance.checkIn).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return {
      success: false,
      antiPassbackViolation: true,
      member: { fullName: memberData.fullName, documentId: memberData.documentId, photoUrl: memberData.photoUrl },
      message: `Acceso denegado: El socio ya registró ingreso hace ${diffMins} minutos. Entrada activa en sala.`
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

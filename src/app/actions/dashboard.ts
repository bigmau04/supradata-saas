'use server'

import { db } from '@/db';
import { payments, expenses, attendances, members, memberSubscriptions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';

export async function getDashboardMetrics() {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const gymId = auth.session.gymId;

  // Hoy
  const today = new Date();
  today.setHours(0,0,0,0);

  // Primer día del mes
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 1. Recaudo del día
  const [{ sum: incomeToday }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
    .from(payments).where(and(eq(payments.gymId, gymId), eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${today.toISOString()}`));

  // 2. Balance del Mes (Ingresos - Egresos)
  const [{ sum: incomeMonth }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
    .from(payments).where(and(eq(payments.gymId, gymId), eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${firstDayOfMonth.toISOString()}`));

  const [{ sum: expenseMonth }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
    .from(expenses).where(and(eq(expenses.gymId, gymId), sql`${expenses.createdAt} >= ${firstDayOfMonth.toISOString()}`));

  const monthBalance = Number(incomeMonth || 0) - Number(expenseMonth || 0);

  // 3. Aforo en vivo (Asistencias de hoy)
  const [{ count: attendancesToday }] = await db.select({ count: sql<number>`count(*)` })
    .from(attendances).where(and(eq(attendances.gymId, gymId), sql`${attendances.checkIn} >= ${today.toISOString()}`));

  return {
    incomeToday: Number(incomeToday || 0),
    monthBalance,
    attendancesToday: Number(attendancesToday || 0)
  };
}

export async function getGymLiveMetrics() {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const gymId = auth.session.gymId;
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const [{ activeMembersCount }] = await db.select({
      activeMembersCount: sql<number>`COALESCE(COUNT(DISTINCT ${members.id}), 0)`.mapWith(Number)
    })
    .from(members)
    .innerJoin(memberSubscriptions, eq(memberSubscriptions.memberId, members.id))
    .where(and(eq(members.gymId, gymId), eq(memberSubscriptions.status, 'active'), sql`${memberSubscriptions.endDate} >= CURRENT_DATE`));

    const [{ peopleInGymCount }] = await db.select({
      peopleInGymCount: sql<number>`COALESCE(COUNT(*), 0)`.mapWith(Number)
    })
    .from(attendances)
    .where(and(eq(attendances.gymId, gymId), sql`${attendances.checkIn} >= ${twoHoursAgo.toISOString()}`, sql`${attendances.checkOut} IS NULL`));

    const [{ expiringSoonCount }] = await db.select({
      expiringSoonCount: sql<number>`COALESCE(COUNT(*), 0)`.mapWith(Number)
    })
    .from(memberSubscriptions)
    .innerJoin(members, eq(members.id, memberSubscriptions.memberId))
    .where(and(eq(members.gymId, gymId), eq(memberSubscriptions.status, 'active'), sql`${memberSubscriptions.endDate} BETWEEN CURRENT_DATE AND ${inFiveDays.toISOString()}`));

    return { success: true, activeMembersCount, peopleInGymCount, expiringSoonCount };
  } catch (err: any) {
    console.error('[getGymLiveMetrics]', err);
    return { success: false, activeMembersCount: 0, peopleInGymCount: 0, expiringSoonCount: 0 };
  }
}

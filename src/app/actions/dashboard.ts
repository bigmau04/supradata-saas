'use server'

import { db } from '@/db';
import { payments, expenses, attendances } from '@/db/schema';
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

'use server'

import { db } from '@/db';
import { payments, expenses, cashShifts, members, coaches, memberSubscriptions } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PAGOS
export async function createPayment(formData: FormData) {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');

  const memberId = formData.get('memberId') as string;
  const amount = formData.get('amount') as string;
  const method = formData.get('method') as 'cash' | 'transfer';
  const referenceNumber = formData.get('referenceNumber') as string;
  const notes = formData.get('notes') as string;
  const coachId = formData.get('coachId') as string;

  await db.insert(payments).values({
    gymId: auth.session.gymId,
    branchId: auth.session.branchId,
    memberId,
    registeredByUserId: auth.session.userId,
    amount,
    method,
    referenceNumber,
    notes,
    coachId: coachId || null,
    status: 'paid'
  });

  revalidatePath('/dashboard/finance');
}

export async function voidPayment(paymentId: string, reason?: string) {
   const auth = await verifySession();
   if (!auth) throw new Error('No autorizado');

   if (auth.session.role !== 'owner' && !reason) {
     throw new Error('Motivo obligatorio para anular');
   }

   const [payment] = await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.gymId, auth.session.gymId)));
   if (!payment) throw new Error('Pago no encontrado');

   if (payment.subscriptionId) {
      // Revert subscription status
      await db.update(memberSubscriptions)
        .set({ status: 'cancelled' })
        .where(eq(memberSubscriptions.id, payment.subscriptionId));
   }

   await db.update(payments)
     .set({ 
       status: 'voided',
       voidReason: reason || 'Anulado por administrador',
       voidedBy: auth.session.userId,
       voidedAt: new Date()
     })
     .where(and(eq(payments.id, paymentId), eq(payments.gymId, auth.session.gymId)));

   revalidatePath('/dashboard/finance');
}

// GASTOS
export async function createExpense(formData: FormData) {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');

  const amount = formData.get('amount') as string;
  const description = formData.get('description') as string;

  await db.insert(expenses).values({
    gymId: auth.session.gymId,
    branchId: auth.session.branchId,
    registeredByUserId: auth.session.userId,
    amount,
    description,
  });

  revalidatePath('/dashboard/finance');
}

// TURNOS DE CAJA
export async function getActiveShift() {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) return null;

  const [shift] = await db.select().from(cashShifts)
    .where(
      and(
        eq(cashShifts.branchId, auth.session.branchId),
        eq(cashShifts.isClosed, false)
      )
    ).limit(1);
    
  return shift;
}

export async function openCashShift(formData: FormData) {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');
  
  const initialCash = formData.get('initialCash') as string || '0';

  await db.insert(cashShifts).values({
    gymId: auth.session.gymId,
    branchId: auth.session.branchId,
    userId: auth.session.userId,
    initialCash,
  });

  revalidatePath('/dashboard/finance');
}

export async function closeCashShift(formData: FormData) {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');

  const finalCashCounted = formData.get('finalCashCounted') as string;
  const shift = await getActiveShift();
  if (!shift) throw new Error('No hay turno abierto');

  // Calcular efectivo esperado = Cash Inicial + Pagos Cash - Gastos Efectivo
  const [{ sum: sumPayments }] = await db.select({
      sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`
    })
    .from(payments)
    .where(
      and(
        eq(payments.branchId, auth.session.branchId),
        eq(payments.method, 'cash'),
        eq(payments.status, 'paid'),
        sql`${payments.createdAt} >= ${shift.openingTime.toISOString()}`
      )
    );

  const [{ sum: sumExpenses }] = await db.select({
      sum: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)`
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.branchId, auth.session.branchId),
        sql`${expenses.createdAt} >= ${shift.openingTime.toISOString()}`
      )
    );

  const expected = Number(shift.initialCash) + Number(sumPayments) - Number(sumExpenses);
  const difference = Number(finalCashCounted) - expected;

  await db.update(cashShifts)
    .set({
      closingTime: new Date(),
      finalCashExpected: expected.toString(),
      finalCashCounted,
      difference: difference.toString(),
      isClosed: true
    })
    .where(eq(cashShifts.id, shift.id));

  revalidatePath('/dashboard/finance');
}

// OBTENER RESUMEN Y DATOS PARA LA VISTA
export async function getFinanceData() {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');

  const activeShift = await getActiveShift();

  const recentPayments = await db.select({
      id: payments.id,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      voidReason: payments.voidReason,
      type: sql<string>`'income'`,
      date: payments.createdAt,
      description: members.fullName
    })
    .from(payments)
    .leftJoin(members, eq(payments.memberId, members.id))
    .where(eq(payments.branchId, auth.session.branchId))
    .orderBy(desc(payments.createdAt))
    .limit(10);

  const recentExpenses = await db.select({
      id: expenses.id,
      amount: expenses.amount,
      type: sql<string>`'expense'`,
      date: expenses.createdAt,
      description: expenses.description,
      method: sql<string>`'cash'`,
      status: sql<string>`'paid'`,
      voidReason: sql<string>`null`
    })
    .from(expenses)
    .where(eq(expenses.branchId, auth.session.branchId))
    .orderBy(desc(expenses.createdAt))
    .limit(10);

  const allRecent = [...recentPayments, ...recentExpenses].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).slice(0, 10);

  const today = new Date();
  today.setHours(0,0,0,0);

  const [{ sum: incomeToday }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
    .from(payments).where(and(eq(payments.branchId, auth.session.branchId), eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${today.toISOString()}`));

  const [{ sum: expenseToday }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
    .from(expenses).where(and(eq(expenses.branchId, auth.session.branchId), sql`${expenses.createdAt} >= ${today.toISOString()}`));

  const membersList = await db.select({ id: members.id, name: members.fullName, document: members.documentId }).from(members).where(eq(members.gymId, auth.session.gymId));
  const coachesList = await db.select({ id: coaches.id, name: coaches.fullName }).from(coaches).where(and(eq(coaches.gymId, auth.session.gymId), eq(coaches.isActive, true)));

  let currentExpectedCash = 0;
  if (activeShift) {
     const [{ sum: sumPaymentsShift }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
       .from(payments).where(and(eq(payments.branchId, auth.session.branchId), eq(payments.method, 'cash'), eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${activeShift.openingTime.toISOString()}`));
     const [{ sum: sumExpensesShift }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
       .from(expenses).where(and(eq(expenses.branchId, auth.session.branchId), sql`${expenses.createdAt} >= ${activeShift.openingTime.toISOString()}`));
     currentExpectedCash = Number(activeShift.initialCash || 0) + Number(sumPaymentsShift || 0) - Number(sumExpensesShift || 0);
  }

  return { activeShift, transactions: allRecent, members: membersList, coaches: coachesList, summary: { incomeToday: Number(incomeToday || 0), expenseToday: Number(expenseToday || 0), currentExpectedCash: Number(currentExpectedCash || 0) } };
}

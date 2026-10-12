'use server'

import { db } from '@/db';
import { payments, expenses, cashShifts, members, coaches, memberSubscriptions, appUsers, branches } from '@/db/schema';
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

  revalidatePath('/dashboard/finances');
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

   revalidatePath('/dashboard/finances');
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

  revalidatePath('/dashboard/finances');
  revalidatePath('/dashboard/reception');
}

// TURNOS DE CAJA
export async function getActiveShift() {
  try {
    const auth = await verifySession();
    if (!auth) return null;

    const gymId = auth.session.gymId;
    const branchId = auth.session.branchId;
    const shiftCond = branchId
      ? and(eq(cashShifts.branchId, branchId), eq(cashShifts.isClosed, false))
      : and(eq(cashShifts.gymId, gymId), eq(cashShifts.isClosed, false));

    const [shift] = await db.select({
        id: cashShifts.id,
        gymId: cashShifts.gymId,
        branchId: cashShifts.branchId,
        userId: cashShifts.userId,
        openingTime: cashShifts.openingTime,
        closingTime: cashShifts.closingTime,
        initialCash: cashShifts.initialCash,
        finalCashExpected: cashShifts.finalCashExpected,
        finalCashCounted: cashShifts.finalCashCounted,
        difference: cashShifts.difference,
        isClosed: cashShifts.isClosed,
        userName: appUsers.fullName,
      })
      .from(cashShifts)
      .leftJoin(appUsers, eq(cashShifts.userId, appUsers.id))
      .where(shiftCond)
      .limit(1);
      
    return shift || null;
  } catch (error) {
    console.error('[getActiveShift]', error);
    return null;
  }
}

export async function openCashShift(formData: FormData) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const gymId = auth.session.gymId;
  let branchId = auth.session.branchId;
  if (!branchId) {
    const [firstBranch] = await db.select().from(branches).where(eq(branches.gymId, gymId)).limit(1);
    branchId = firstBranch?.id;
  }
  if (!branchId) throw new Error('No se encontró una sede asociada');
  
  const initialCash = (formData.get('initialCash') as string) || '0';

  await db.insert(cashShifts).values({
    gymId,
    branchId,
    userId: auth.session.userId,
    initialCash,
  });

  revalidatePath('/dashboard/finances');
  revalidatePath('/dashboard/reception');
}

export async function closeCashShift(formData: FormData) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const finalCashCounted = formData.get('finalCashCounted') as string;
  const shift = await getActiveShift();
  if (!shift) throw new Error('No hay turno abierto');

  const branchId = auth.session.branchId || shift.branchId;
  const payWhere = branchId
    ? and(
        eq(payments.branchId, branchId),
        eq(payments.method, 'cash'),
        eq(payments.status, 'paid'),
        sql`${payments.createdAt} >= ${shift.openingTime.toISOString()}`
      )
    : and(
        eq(payments.gymId, auth.session.gymId),
        eq(payments.method, 'cash'),
        eq(payments.status, 'paid'),
        sql`${payments.createdAt} >= ${shift.openingTime.toISOString()}`
      );

  const expWhere = branchId
    ? and(
        eq(expenses.branchId, branchId),
        sql`${expenses.createdAt} >= ${shift.openingTime.toISOString()}`
      )
    : and(
        eq(expenses.gymId, auth.session.gymId),
        sql`${expenses.createdAt} >= ${shift.openingTime.toISOString()}`
      );

  const [{ sum: sumPayments }] = await db.select({
      sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`
    })
    .from(payments)
    .where(payWhere);

  const [{ sum: sumExpenses }] = await db.select({
      sum: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)`
    })
    .from(expenses)
    .where(expWhere);

  const expected = Number(shift.initialCash || 0) + Number(sumPayments || 0) - Number(sumExpenses || 0);
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

  revalidatePath('/dashboard/finances');
  revalidatePath('/dashboard/reception');
}

// OBTENER RESUMEN Y DATOS PARA LA VISTA (ESTRICTAMENTE AUDITORÍA)
export async function getFinanceData() {
  try {
    const auth = await verifySession();
    if (!auth) {
      return {
        activeShift: null,
        transactions: [],
        closedShifts: [],
        summary: {
          incomeToday: 0,
          expenseToday: 0,
          incomeMonth: 0,
          expenseMonth: 0,
          totalDifference: 0,
          discrepancyCount: 0,
          currentExpectedCash: 0,
        },
      };
    }

    const gymId = auth.session.gymId;
    const branchId = auth.session.branchId;

    const paymentWhere = branchId ? eq(payments.branchId, branchId) : eq(payments.gymId, gymId);
    const expenseWhere = branchId ? eq(expenses.branchId, branchId) : eq(expenses.gymId, gymId);
    const shiftWhere = branchId ? eq(cashShifts.branchId, branchId) : eq(cashShifts.gymId, gymId);

    const activeShift = await getActiveShift();

    const recentPayments = await db.select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        voidReason: payments.voidReason,
        type: sql<string>`'income'`,
        date: payments.createdAt,
        description: sql<string>`COALESCE(${members.fullName}, 'Mostrador')`
      })
      .from(payments)
      .leftJoin(members, eq(payments.memberId, members.id))
      .where(paymentWhere)
      .orderBy(desc(payments.createdAt))
      .limit(30);

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
      .where(expenseWhere)
      .orderBy(desc(expenses.createdAt))
      .limit(30);

    const allRecent = [...recentPayments, ...recentExpenses]
      .filter((tx) => tx && tx.date)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 30);

    // Historial de turnos cerrados para auditoría
    const closedShifts = await db.select({
        id: cashShifts.id,
        openingTime: cashShifts.openingTime,
        closingTime: cashShifts.closingTime,
        initialCash: cashShifts.initialCash,
        finalCashExpected: cashShifts.finalCashExpected,
        finalCashCounted: cashShifts.finalCashCounted,
        difference: cashShifts.difference,
        userName: appUsers.fullName,
      })
      .from(cashShifts)
      .leftJoin(appUsers, eq(cashShifts.userId, appUsers.id))
      .where(and(shiftWhere, eq(cashShifts.isClosed, true)))
      .orderBy(desc(cashShifts.closingTime))
      .limit(15);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [{ sum: incomeToday }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
      .from(payments).where(and(paymentWhere, eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${today.toISOString()}`));

    const [{ sum: expenseToday }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
      .from(expenses).where(and(expenseWhere, sql`${expenses.createdAt} >= ${today.toISOString()}`));

    const [{ sum: incomeMonth }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
      .from(payments).where(and(paymentWhere, eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${firstDayOfMonth.toISOString()}`));

    const [{ sum: expenseMonth }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
      .from(expenses).where(and(expenseWhere, sql`${expenses.createdAt} >= ${firstDayOfMonth.toISOString()}`));

    const [{ sum: totalDifference }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${cashShifts.difference} AS NUMERIC)), 0)` })
      .from(cashShifts).where(and(shiftWhere, eq(cashShifts.isClosed, true)));

    const [{ count: discrepancyCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(cashShifts).where(and(shiftWhere, eq(cashShifts.isClosed, true), sql`CAST(${cashShifts.difference} AS NUMERIC) != 0`));

    let currentExpectedCash = 0;
    if (activeShift && activeShift.openingTime) {
      const [{ sum: sumPaymentsShift }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)` })
        .from(payments).where(and(paymentWhere, eq(payments.method, 'cash'), eq(payments.status, 'paid'), sql`${payments.createdAt} >= ${new Date(activeShift.openingTime).toISOString()}`));
      const [{ sum: sumExpensesShift }] = await db.select({ sum: sql<string | number>`COALESCE(SUM(CAST(${expenses.amount} AS NUMERIC)), 0)` })
        .from(expenses).where(and(expenseWhere, sql`${expenses.createdAt} >= ${new Date(activeShift.openingTime).toISOString()}`));
      currentExpectedCash = Number(activeShift.initialCash || 0) + Number(sumPaymentsShift || 0) - Number(sumExpensesShift || 0);
    }

    return {
      activeShift: activeShift ? {
        ...activeShift,
        currentExpectedCash
      } : null,
      transactions: allRecent || [],
      closedShifts: closedShifts || [],
      summary: {
        incomeToday: Number(incomeToday || 0),
        expenseToday: Number(expenseToday || 0),
        incomeMonth: Number(incomeMonth || 0),
        expenseMonth: Number(expenseMonth || 0),
        totalDifference: Number(totalDifference || 0),
        discrepancyCount: Number(discrepancyCount || 0),
        currentExpectedCash: Number(currentExpectedCash || 0)
      }
    };
  } catch (error) {
    console.error('[getFinanceData] Error fetching finance data:', error);
    return {
      activeShift: null,
      transactions: [],
      closedShifts: [],
      summary: {
        incomeToday: 0,
        expenseToday: 0,
        incomeMonth: 0,
        expenseMonth: 0,
        totalDifference: 0,
        discrepancyCount: 0,
        currentExpectedCash: 0,
      },
    };
  }
}

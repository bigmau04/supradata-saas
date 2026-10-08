'use server'
import { db } from '@/db';
import { cashShifts, expenses, payments } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getActiveShift() {
  const auth = await verifySession();
  if (!auth) return null;

  const [shift] = await db.select()
    .from(cashShifts)
    .where(and(
      eq(cashShifts.userId, auth.session.userId),
      eq(cashShifts.isClosed, false)
    ))
    .limit(1);

  if (!shift) return null;

  const shiftPayments = await db.select().from(payments).where(and(
    eq(payments.registeredByUserId, auth.session.userId),
    gte(payments.createdAt, shift.openingTime)
  ));
  
  const shiftExpenses = await db.select().from(expenses).where(and(
    eq(expenses.registeredByUserId, auth.session.userId),
    gte(expenses.createdAt, shift.openingTime)
  ));

  const totalCashIn = shiftPayments
    .filter(p => p.method === 'cash' && p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const totalExpenses = shiftExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const expectedCash = Number(shift.initialCash) + totalCashIn - totalExpenses;

  const transactions = [
    ...shiftPayments.map(p => ({
      id: p.id,
      date: p.createdAt,
      description: p.concept === 'quick_pass' ? 'Pase Exprés' : (p.concept === 'product_sale' ? `Venta: ${p.notes || 'Mostrador'}` : 'Pago Membresía'),
      method: p.method,
      amount: Number(p.amount),
      type: 'income',
      status: p.status
    })),
    ...shiftExpenses.map(e => ({
      id: e.id,
      date: e.createdAt,
      description: `Gasto: ${e.description}`,
      method: 'cash',
      amount: Number(e.amount),
      type: 'expense',
      status: 'paid'
    }))
  ].sort((a, b) => b.date!.getTime() - a.date!.getTime());

  return {
    ...shift,
    totalCashIn,
    totalExpenses,
    expectedCash,
    transactions
  };
}

export async function openShift(formData: FormData) {
  try {
    const auth = await verifySession();
    if (!auth) return { success: false, message: 'No autorizado.' };
    if (!auth.session.branchId) return { success: false, message: 'Tu usuario no tiene una sucursal asignada. Contacta al administrador.' };

    const initialCash = formData.get('initialCash') as string;
    await db.insert(cashShifts).values({
      gymId: auth.session.gymId,
      branchId: auth.session.branchId,
      userId: auth.session.userId,
      initialCash: initialCash || '0'
    });
    revalidatePath('/dashboard/reception');
    return { success: true };
  } catch (err) {
    console.error('[openShift]', err);
    return { success: false, message: 'Error al abrir el turno. Intenta de nuevo.' };
  }
}

export async function closeShift(formData: FormData) {
  try {
    const auth = await verifySession();
    if (!auth) return { success: false, message: 'No autorizado.' };

    const shiftId = formData.get('shiftId') as string;
    const expected = formData.get('expected') as string;
    const counted = formData.get('counted') as string;

    if (!shiftId) return { success: false, message: 'Turno no identificado. Recarga la pagina e intenta de nuevo.' };
    if (!counted || isNaN(Number(counted))) return { success: false, message: 'Ingresa un valor valido de efectivo contado.' };

    const expectedNum = Number(expected);
    const countedNum = Number(counted);
    const diff = countedNum - expectedNum;

    await db.update(cashShifts).set({
      isClosed: true,
      closingTime: new Date(),
      finalCashExpected: expectedNum.toString(),
      finalCashCounted: countedNum.toString(),
      difference: diff.toString()
    }).where(eq(cashShifts.id, shiftId));

    revalidatePath('/dashboard/reception');
    return { success: true };
  } catch (err) {
    console.error('[closeShift]', err);
    return { success: false, message: 'Error al cerrar el turno. Intenta de nuevo.' };
  }
}

export async function registerMinorExpense(formData: FormData) {
  try {
    const auth = await verifySession();
    if (!auth) return { success: false, message: 'No autorizado.' };
    if (!auth.session.branchId) return { success: false, message: 'Tu usuario no tiene una sucursal asignada.' };

    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;

    if (!description?.trim()) return { success: false, message: 'La descripcion del gasto es obligatoria.' };
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return { success: false, message: 'El monto del gasto debe ser un numero positivo.' };
    }

    await db.insert(expenses).values({
      gymId: auth.session.gymId,
      branchId: auth.session.branchId,
      registeredByUserId: auth.session.userId,
      amount,
      description: description.trim()
    });

    revalidatePath('/dashboard/reception');
    revalidatePath('/dashboard/finance');
    return { success: true };
  } catch (err) {
    console.error('[registerMinorExpense]', err);
    return { success: false, message: 'Error al registrar el gasto. Intenta de nuevo.' };
  }
}

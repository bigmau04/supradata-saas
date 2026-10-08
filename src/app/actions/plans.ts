'use server';

import { db } from '@/db';
import { membershipPlans } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPlansAdmin() {
  const auth = await verifySession();
  if (!auth) return [];
  return db.select().from(membershipPlans).where(eq(membershipPlans.gymId, auth.session.gymId)).orderBy(desc(membershipPlans.durationDays));
}

export async function createPlan(formData: FormData) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') return { success: false, message: 'No autorizado' };

  const name = formData.get('name') as string;
  const durationDaysStr = formData.get('durationDays') as string;
  const price = formData.get('price') as string;
  const description = formData.get('description') as string;

  if (!name || !durationDaysStr || !price) return { success: false, message: 'Campos requeridos' };

  const durationDays = parseInt(durationDaysStr);

  try {
    await db.insert(membershipPlans).values({
      gymId: auth.session.gymId,
      name,
      durationDays,
      price,
      description: description || null
    });
    revalidatePath('/dashboard/plans');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Error al crear plan' };
  }
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') return { success: false };

  await db.update(membershipPlans).set({ isActive }).where(and(eq(membershipPlans.id, id), eq(membershipPlans.gymId, auth.session.gymId)));
  revalidatePath('/dashboard/plans');
  return { success: true };
}

export async function updateMembershipPlan(formData: FormData) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') return { success: false, error: 'No autorizado' };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const durationDaysStr = formData.get('durationDays') as string;
  const price = formData.get('price') as string;

  if (!id || !name || !durationDaysStr || !price) return { success: false, error: 'Campos requeridos' };

  const durationDays = parseInt(durationDaysStr);

  try {
    await db.update(membershipPlans)
      .set({ name, durationDays, price })
      .where(and(eq(membershipPlans.id, id), eq(membershipPlans.gymId, auth.session.gymId)));
    revalidatePath('/dashboard/plans');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al actualizar plan' };
  }
}

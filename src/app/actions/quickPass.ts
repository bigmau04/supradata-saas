'use server'

import { db } from '@/db';
import { members, memberSubscriptions, payments, attendances, membershipPlans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export type QuickPassResult = {
  success: boolean;
  member?: {
    fullName: string;
    photoUrl: string | null;
  };
  message: string;
};

export async function registerQuickPass(formData: FormData): Promise<QuickPassResult> {
  const auth = await verifySession();
  if (!auth || !auth.session.branchId) throw new Error('No autorizado');

  const gymId = auth.session.gymId;
  const branchId = auth.session.branchId;
  
  const documentId = formData.get('documentId') as string;
  const fullName = formData.get('fullName') as string;
  const amount = formData.get('amount') as string;
  const method = formData.get('method') as 'cash' | 'transfer';
  const coachId = formData.get('coachId') as string;

  try {
    let [dailyPlan] = await db.select().from(membershipPlans)
      .where(and(eq(membershipPlans.gymId, gymId), eq(membershipPlans.name, 'Pase Diario Exprés')))
      .limit(1);

    if (!dailyPlan) {
      const [newPlan] = await db.insert(membershipPlans).values({
        gymId,
        name: 'Pase Diario Exprés',
        durationDays: 1,
        price: '10000',
        isActive: true
      }).returning();
      dailyPlan = newPlan;
    }

    let [member] = await db.select().from(members)
      .where(and(eq(members.gymId, gymId), eq(members.documentId, documentId)))
      .limit(1);

    if (!member) {
      const token = crypto.randomBytes(32).toString('hex');
      const [newMember] = await db.insert(members).values({
        gymId,
        documentId,
        fullName,
        phone: '0000000000',
        qrAccessToken: token,
      }).returning();
      member = newMember;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [subscription] = await db.insert(memberSubscriptions).values({
      gymId,
      branchId,
      memberId: member.id,
      planId: dailyPlan.id,
      startDate: todayStr,
      endDate: todayStr,
      status: 'active',
      notes: 'Visita Exprés'
    }).returning();

    await db.insert(payments).values({
      gymId,
      branchId,
      memberId: member.id,
      subscriptionId: subscription.id,
      coachId: coachId || null,
      registeredByUserId: auth.session.userId,
      amount,
      method,
      status: 'paid',
      notes: 'Cobro de Día Exprés'
    });

    await db.insert(attendances).values({
      gymId,
      branchId,
      memberId: member.id,
      method: 'manual_doc'
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/finance');
    revalidatePath('/dashboard/reception');

    return {
      success: true,
      member: {
        fullName: member.fullName,
        photoUrl: member.photoUrl
      },
      message: 'ACCESO PERMITIDO - DÍA PAGADO'
    };
  } catch (error) {
    console.error("Error en QuickPass:", error);
    return { success: false, message: 'Error al procesar la visita exprés' };
  }
}

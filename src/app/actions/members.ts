'use server'

import { db } from '@/db';
import { members, memberSubscriptions, branches, membershipPlans, attendances, payments, coaches } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export type ActionResult<T = null> =
  | { success: true; data?: T }
  | { success: false; error: string };

// --- Queries -----------------------------------------------------------------

export async function updateMemberCoachByToken(token: string, coachId: string | null) {
  try {
    await db.update(members)
      .set({ coachId })
      .where(eq(members.qrAccessToken, token));
    revalidatePath(`/pass/${token}`);
    return { success: true };
  } catch (err) {
    console.error('[updateMemberCoachByToken]', err);
    return { success: false, error: 'Error al actualizar entrenador' };
  }
}

export async function getMembers() {
  try {
    const auth = await verifySession();
    if (!auth) return [];

    const data = await db
      .select({
        id: members.id,
        fullName: members.fullName,
        documentId: members.documentId,
        phone: members.phone,
        qrAccessToken: members.qrAccessToken,
        status: memberSubscriptions.status,
        endDate: memberSubscriptions.endDate,
        planId: memberSubscriptions.planId,
        subscriptionId: memberSubscriptions.id,
        planPrice: membershipPlans.price,
        planName: membershipPlans.name,
        lastAttendance: sql<Date | null>`(SELECT MAX(check_in) FROM ${attendances} WHERE member_id = ${members.id})`.as('last_attendance'),
      })
      .from(members)
      .leftJoin(
        memberSubscriptions,
        and(
          eq(memberSubscriptions.memberId, members.id),
          eq(memberSubscriptions.status, 'active')
        )
      )
      .leftJoin(membershipPlans, eq(memberSubscriptions.planId, membershipPlans.id))
      .where(eq(members.gymId, auth.session.gymId))
      .orderBy(desc(members.createdAt));

    const uniqueMap = new Map<string, (typeof data)[0]>();
    for (const row of data) {
      if (!uniqueMap.has(row.id)) {
        uniqueMap.set(row.id, row);
      } else {
        const existing = uniqueMap.get(row.id)!;
        if (row.endDate && existing.endDate && new Date(row.endDate) > new Date(existing.endDate)) {
          uniqueMap.set(row.id, row);
        }
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return Array.from(uniqueMap.values()).map((member) => {
      let daysSinceLastAttendance = -1;
      if (member.lastAttendance) {
        const last = new Date(member.lastAttendance);
        daysSinceLastAttendance = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
      }

      let daysUntilExpiry = -999;
      if (member.endDate) {
        const end = new Date(member.endDate);
        daysUntilExpiry = Math.floor((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
      }

      let churnStatus: 'healthy' | 'risk' | 'critical' = 'healthy';
      if (daysUntilExpiry <= 2 || daysUntilExpiry === -999 || (daysSinceLastAttendance > 7 && daysSinceLastAttendance !== -1)) {
        churnStatus = 'critical';
      } else if (daysUntilExpiry <= 7 || (daysSinceLastAttendance >= 5 && daysSinceLastAttendance <= 7)) {
        churnStatus = 'risk';
      }

      return { ...member, daysSinceLastAttendance, daysUntilExpiry, churnStatus };
    });
  } catch (err) {
    console.error('[getMembers]', err);
    return [];
  }
}

export async function getPlans() {
  try {
    const auth = await verifySession();
    if (!auth) return [];
    return db.select().from(membershipPlans).where(
      and(eq(membershipPlans.gymId, auth.session.gymId), eq(membershipPlans.isActive, true))
    );
  } catch (err) {
    console.error('[getPlans]', err);
    return [];
  }
}

export async function getCoachesForMembers() {
  try {
    const auth = await verifySession();
    if (!auth) return [];
    return db
      .select({ id: coaches.id, fullName: coaches.fullName })
      .from(coaches)
      .where(and(eq(coaches.gymId, auth.session.gymId), eq(coaches.isActive, true)));
  } catch (err) {
    console.error('[getCoachesForMembers]', err);
    return [];
  }
}

// --- Crear miembro ------------------------------------------------------------

export async function createMember(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await verifySession();
    if (!auth) return { success: false, error: 'No autorizado. Por favor inicia sesion de nuevo.' };

    const fullName = (formData.get('fullName') as string)?.trim();
    const documentId = (formData.get('documentId') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const planId = formData.get('planId') as string;

    if (!fullName) return { success: false, error: 'El nombre completo es obligatorio.' };
    if (!documentId) return { success: false, error: 'El numero de documento es obligatorio.' };
    if (!phone) return { success: false, error: 'El telefono es obligatorio.' };

    const qrAccessToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(4).toString('hex');

    const [newMember] = await db.insert(members).values({
      gymId: auth.session.gymId,
      fullName,
      documentId,
      phone,
      qrAccessToken,
    }).returning();

    if (planId) {
      const [branch] = await db.select().from(branches).where(eq(branches.gymId, auth.session.gymId)).limit(1);
      const [plan] = await db.select().from(membershipPlans).where(eq(membershipPlans.id, planId));

      if (branch && plan && plan.durationDays > 0) {
        const startDate = new Date();
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + plan.durationDays);

        await db.insert(memberSubscriptions).values({
          gymId: auth.session.gymId,
          branchId: branch.id,
          memberId: newMember.id,
          planId: plan.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: 'active',
        });
      }
    }

    revalidatePath('/dashboard/members');
    return { success: true };
  } catch (err: any) {
    console.error('[createMember]', err);
    if (err?.code === '23505' || String(err?.message).includes('duplicate') || String(err?.message).includes('unique')) {
      return { success: false, error: 'Ya existe un socio con ese numero de documento en este gimnasio.' };
    }
    return { success: false, error: 'Error al crear el socio. Verifica los datos e intenta de nuevo.' };
  }
}

// --- Renovar / cambiar plan ---------------------------------------------------

export async function renewMemberPlan(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await verifySession();
    if (!auth) return { success: false, error: 'No autorizado. Por favor inicia sesion de nuevo.' };

    const memberId = formData.get('memberId') as string;
    const planId = formData.get('planId') as string;
    const method = formData.get('method') as 'cash' | 'transfer';
    const coachId = (formData.get('coachId') as string) || null;
    const referenceNumber = (formData.get('referenceNumber') as string) || null;

    if (!memberId) return { success: false, error: 'Socio no especificado.' };
    if (!planId) return { success: false, error: 'Selecciona un plan valido.' };
    if (!method || !['cash', 'transfer'].includes(method)) {
      return { success: false, error: 'Selecciona un metodo de pago valido (Efectivo o Transferencia).' };
    }

    const [plan] = await db.select().from(membershipPlans).where(
      and(eq(membershipPlans.id, planId), eq(membershipPlans.gymId, auth.session.gymId))
    );
    if (!plan) return { success: false, error: 'El plan seleccionado no existe o no esta disponible.' };
    if (!plan.durationDays || plan.durationDays <= 0) {
      return { success: false, error: 'El plan seleccionado tiene una duracion invalida. Contacta al administrador.' };
    }

    const [branch] = await db.select().from(branches).where(eq(branches.gymId, auth.session.gymId)).limit(1);
    if (!branch) return { success: false, error: 'No se encontro una sucursal configurada para este gimnasio.' };

    // Marcar suscripciones activas anteriores como 'cancelled' (reemplazadas)
    const activeSubs = await db.select().from(memberSubscriptions).where(
      and(eq(memberSubscriptions.memberId, memberId), eq(memberSubscriptions.status, 'active'))
    );
    for (const sub of activeSubs) {
      await db.update(memberSubscriptions)
        .set({ status: 'cancelled' })
        .where(eq(memberSubscriptions.id, sub.id));
    }


    // Calcular fechas limpias (sin horas para evitar Invalid Date)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + plan.durationDays);

    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // Crear nueva suscripcion
    const [newSub] = await db.insert(memberSubscriptions).values({
      gymId: auth.session.gymId,
      branchId: branch.id,
      memberId,
      planId: plan.id,
      startDate: startStr,
      endDate: endStr,
      status: 'active',
      notes: `Renovacion por ${auth.session.role}`,
    }).returning();

    // Registrar pago
    await db.insert(payments).values({
      gymId: auth.session.gymId,
      branchId: branch.id,
      memberId,
      subscriptionId: newSub.id,
      coachId: coachId || null,
      registeredByUserId: auth.session.userId,
      amount: plan.price,
      method,
      referenceNumber: referenceNumber || null,
      concept: 'membership',
      status: 'paid',
      notes: `Plan: ${plan.name}`,
    });

    revalidatePath('/dashboard/members');
    revalidatePath('/dashboard/finance');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('[renewMemberPlan]', err);
    return { success: false, error: 'Error al procesar la renovacion. Por favor intenta de nuevo.' };
  }
}

'use server'

import { db } from '@/db';
import { members, memberSubscriptions, branches, membershipPlans, attendances } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function getMembers() {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const data = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      documentId: members.documentId,
      phone: members.phone,
      qrAccessToken: members.qrAccessToken,
      status: memberSubscriptions.status,
      endDate: memberSubscriptions.endDate,
      planPrice: membershipPlans.price,
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
    .leftJoin(
      membershipPlans,
      eq(memberSubscriptions.planId, membershipPlans.id)
    )
    .where(eq(members.gymId, auth.session.gymId))
    .orderBy(desc(members.createdAt));

  const uniqueMembersMap = new Map();
  for (const row of data) {
    if (!uniqueMembersMap.has(row.id)) {
      uniqueMembersMap.set(row.id, row);
    } else {
      const existing = uniqueMembersMap.get(row.id);
      if (row.endDate && existing.endDate && new Date(row.endDate) > new Date(existing.endDate)) {
        uniqueMembersMap.set(row.id, row);
      }
    }
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const processedMembers = Array.from(uniqueMembersMap.values()).map((member) => {
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
    } else {
      churnStatus = 'healthy';
    }

    return {
      ...member,
      daysSinceLastAttendance,
      daysUntilExpiry,
      churnStatus
    };
  });

  return processedMembers;
}

export async function getPlans() {
  const auth = await verifySession();
  if (!auth) return [];
  return db.select().from(membershipPlans).where(eq(membershipPlans.gymId, auth.session.gymId));
}

export async function createMember(formData: FormData) {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const fullName = formData.get('fullName') as string;
  const documentId = formData.get('documentId') as string;
  const phone = formData.get('phone') as string;
  const planId = formData.get('planId') as string; 

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

    if (branch && plan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.durationDays);

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
  return newMember;
}

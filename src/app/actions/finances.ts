'use server'

import { db } from '@/db';
import { payments, members, memberSubscriptions, membershipPlans } from '@/db/schema';
import { eq, and, sql, or } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';

export async function getFinancialOverview(timeframe: 'today' | 'week' | 'month' | 'year') {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const gymId = auth.session.gymId;
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (timeframe === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      prevEndDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }

    const baseCondition = and(eq(payments.gymId, gymId), eq(payments.status, 'paid'));

    const currentPeriodResult = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`.mapWith(Number),
      memberships: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)) FILTER (WHERE ${payments.concept} = 'membership'), 0)`.mapWith(Number),
      store: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)) FILTER (WHERE ${payments.concept} = 'store'), 0)`.mapWith(Number),
      express: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)) FILTER (WHERE ${payments.concept} = 'express_pass'), 0)`.mapWith(Number),
      cash: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)) FILTER (WHERE ${payments.method} = 'cash'), 0)`.mapWith(Number),
      transfer: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)) FILTER (WHERE ${payments.method} = 'transfer'), 0)`.mapWith(Number),
    }).from(payments)
    .where(and(baseCondition, sql`${payments.createdAt} >= ${startDate.toISOString()}`));

    const prevPeriodResult = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`.mapWith(Number)
    }).from(payments)
    .where(and(baseCondition, sql`${payments.createdAt} >= ${prevStartDate.toISOString()}`, sql`${payments.createdAt} <= ${prevEndDate.toISOString()}`));

    const current = currentPeriodResult[0];
    const prev = prevPeriodResult[0];

    const percentageChange = prev.total === 0 ? (current.total > 0 ? 100 : 0) : ((current.total - prev.total) / prev.total) * 100;

    const chartDataRaw = await db.select({
      date: sql<string>`DATE(${payments.createdAt})`,
      total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`.mapWith(Number)
    }).from(payments)
    .where(and(baseCondition, sql`${payments.createdAt} >= ${startDate.toISOString()}`))
    .groupBy(sql`DATE(${payments.createdAt})`)
    .orderBy(sql`DATE(${payments.createdAt})`);

    return {
      success: true,
      data: {
        total: current.total,
        percentageChange,
        byConcept: {
          memberships: current.memberships,
          store: current.store,
          express: current.express
        },
        byMethod: {
          cash: current.cash,
          transfer: current.transfer
        },
        chartData: chartDataRaw
      }
    };
  } catch (error: any) {
    console.error('[getFinancialOverview]', error);
    return { success: false, error: error.message };
  }
}

export async function getRevenueRecoveryData() {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');

    const gymId = auth.session.gymId;
    const now = new Date();
    now.setHours(0,0,0,0);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const data = await db.select({
      id: members.id,
      fullName: members.fullName,
      phone: members.phone,
      endDate: memberSubscriptions.endDate,
      status: memberSubscriptions.status,
      planName: membershipPlans.name,
      planPrice: membershipPlans.price
    }).from(members)
    .innerJoin(memberSubscriptions, eq(memberSubscriptions.memberId, members.id))
    .innerJoin(membershipPlans, eq(membershipPlans.id, memberSubscriptions.planId))
    .where(and(
      eq(members.gymId, gymId),
      or(
        and(eq(memberSubscriptions.status, 'expired'), sql`${memberSubscriptions.endDate} >= ${fifteenDaysAgo.toISOString()}`),
        and(eq(memberSubscriptions.status, 'active'), sql`${memberSubscriptions.endDate} <= ${inFiveDays.toISOString()}`)
      )
    ))
    .orderBy(memberSubscriptions.endDate);

    const totalAtRisk = data.reduce((acc, curr) => acc + Number(curr.planPrice), 0);

    return { success: true, data, totalAtRisk };
  } catch (error: any) {
    console.error('[getRevenueRecoveryData]', error);
    return { success: false, error: error.message };
  }
}

export async function getDailyBreakdown(dateStr: string) {
  try {
    const auth = await verifySession();
    if (!auth) throw new Error('No autorizado');
    
    const data = await db.select({
      id: payments.id,
      concept: payments.concept,
      amount: payments.amount,
      method: payments.method,
      createdAt: payments.createdAt,
      memberFullName: members.fullName
    }).from(payments)
    .leftJoin(members, eq(members.id, payments.memberId))
    .where(and(
      eq(payments.gymId, auth.session.gymId),
      eq(payments.status, 'paid'),
      sql`DATE(${payments.createdAt}) = ${dateStr}`
    ))
    .orderBy(payments.createdAt);

    return { success: true, data };
  } catch (error: any) {
    console.error('[getDailyBreakdown]', error);
    return { success: false, error: error.message };
  }
}

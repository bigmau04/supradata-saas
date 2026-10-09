import crypto from 'crypto';
import fs from 'fs';

// Load .env.local BEFORE any other imports
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/\r/g, '').replace(/^"|"$/g, '').trim();
  });
} catch(e) {}

import { eq } from 'drizzle-orm';

async function seed() {
  const { db } = await import('./src/db');
  const { gyms, branches, membershipPlans, members, memberSubscriptions, payments, appUsers } = await import('./src/db/schema');
  console.log('Starting 3-month seed...');
  
  const allGyms = await db.select().from(gyms);
  if (allGyms.length === 0) {
    console.log('No gyms found. Exiting.');
    process.exit(0);
  }
  // Try to find the gym_id from the first appUser or member
  let gymId: string = allGyms[0].id;
  const existingUsers = await db.select().from(appUsers);
  if (existingUsers.length > 0 && existingUsers[0].gymId) {
    gymId = existingUsers[0].gymId;
  }
  
  console.log(`-> Insertando datos para gym_id: ${gymId}`);
  
  const allBranches = await db.select().from(branches).where(eq(branches.gymId, gymId));
  const branch = allBranches[0];

  const allUsers = await db.select().from(appUsers).where(eq(appUsers.gymId, gymId));
  const user = allUsers[0];

  if (!branch || !user) {
    console.log('Missing branch or user for the active gym. Exiting.');
    process.exit(0);
  }

  // Insert Plans
  const [monthlyPlan] = await db.insert(membershipPlans).values({
    gymId: gymId,
    name: 'Plan Mensual Prueba 3M',
    durationDays: 30,
    price: '120000',
    description: 'Mensual test 3M'
  }).returning();

  const [dailyPlan] = await db.insert(membershipPlans).values({
    gymId: gymId,
    name: 'Pase Diario Prueba 3M',
    durationDays: 1,
    price: '25000',
    description: 'Diario test 3M'
  }).returning();

  // Create 25 Members
  const insertedMembers = [];
  for (let i = 1; i <= 25; i++) {
    const [m] = await db.insert(members).values({
      gymId: gymId,
      documentId: 'SEED3M' + Math.floor(Math.random() * 1000000),
      fullName: 'Socio 3M ' + i,
      phone: '3000000' + i.toString().padStart(3, '0'),
      qrAccessToken: crypto.randomBytes(32).toString('hex')
    }).returning();
    insertedMembers.push(m);
  }

  const now = new Date();
  
  // 6 registros con endDate en los próximos 2 a 4 días (ACTIVE)
  for (let i = 0; i < 6; i++) {
    const m = insertedMembers[i];
    const end = new Date(now);
    end.setDate(now.getDate() + 2 + Math.floor(Math.random() * 3)); // 2 to 4 days
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    await db.insert(memberSubscriptions).values({
      gymId: gymId,
      branchId: branch.id,
      memberId: m.id,
      planId: monthlyPlan.id,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      status: 'active'
    });
  }

  // 4 registros con endDate vencido hace 3 a 10 días (EXPIRED)
  for (let i = 6; i < 10; i++) {
    const m = insertedMembers[i];
    const end = new Date(now);
    end.setDate(now.getDate() - 3 - Math.floor(Math.random() * 8)); // 3 to 10 days ago
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    await db.insert(memberSubscriptions).values({
      gymId: gymId,
      branchId: branch.id,
      memberId: m.id,
      planId: monthlyPlan.id,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      status: 'expired'
    });
  }

  // 15 pagos en los últimos 90 días
  for (let i = 0; i < 15; i++) {
    const paymentDate = new Date(now);
    paymentDate.setDate(now.getDate() - Math.floor(Math.random() * 90)); // last 90 days
    paymentDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

    const m = insertedMembers[Math.floor(Math.random() * insertedMembers.length)];
    const amount = 60000 + Math.floor(Math.random() * 60000); // 60,000 to 120,000

    await db.insert(payments).values({
      gymId: gymId,
      branchId: branch.id,
      memberId: m.id,
      subscriptionId: null, // doesn't matter for metrics
      concept: 'membership',
      amount: amount.toString(),
      method: Math.random() > 0.5 ? 'cash' : 'transfer',
      status: 'paid',
      registeredByUserId: user.id,
      createdAt: paymentDate,
    });
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

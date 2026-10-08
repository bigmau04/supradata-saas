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
  const gym = allGyms[0];
  
  const allBranches = await db.select().from(branches).where(eq(branches.gymId, gym.id));
  const branch = allBranches[0];

  const allUsers = await db.select().from(appUsers).where(eq(appUsers.gymId, gym.id));
  const user = allUsers[0];

  if (!branch || !user) {
    console.log('Missing branch or user. Exiting.');
    process.exit(0);
  }

  // Insert Plans
  const [monthlyPlan] = await db.insert(membershipPlans).values({
    gymId: gym.id,
    name: 'Plan Mensual Prueba 3M',
    durationDays: 30,
    price: '100000',
    description: 'Mensual test 3M'
  }).returning();

  const [dailyPlan] = await db.insert(membershipPlans).values({
    gymId: gym.id,
    name: 'Pase Diario Prueba 3M',
    durationDays: 1,
    price: '15000',
    description: 'Diario test 3M'
  }).returning();

  // Create 25 Members
  const insertedMembers = [];
  for (let i = 1; i <= 25; i++) {
    const [m] = await db.insert(members).values({
      gymId: gym.id,
      documentId: 'SEED3M' + Math.floor(Math.random() * 1000000),
      fullName: 'Socio 3M ' + i,
      phone: '3000000' + i.toString().padStart(3, '0'),
      qrAccessToken: crypto.randomBytes(32).toString('hex')
    }).returning();
    insertedMembers.push(m);
  }

  const now = new Date();
  
  // Create 3 months of payments and subscriptions
  // 90 days range
  for (let i = 0; i < 90; i++) {
    // 1 to 3 payments per day
    const numPayments = Math.floor(Math.random() * 3) + 1;
    
    for (let p = 0; p < numPayments; p++) {
      const paymentDate = new Date(now);
      paymentDate.setDate(now.getDate() - i);
      paymentDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

      const m = insertedMembers[Math.floor(Math.random() * insertedMembers.length)];
      const isDaily = Math.random() > 0.8;
      const plan = isDaily ? dailyPlan : monthlyPlan;
      
      const start = new Date(paymentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + plan.durationDays);

      let subId = null;
      // Only insert subscription if it's not a past daily pass that we don't care about, or just insert it anyway
      const [sub] = await db.insert(memberSubscriptions).values({
        gymId: gym.id,
        branchId: branch.id,
        memberId: m.id,
        planId: plan.id,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        status: end > now ? 'active' : 'expired'
      }).returning();
      subId = sub.id;

      await db.insert(payments).values({
        gymId: gym.id,
        branchId: branch.id,
        memberId: m.id,
        subscriptionId: subId,
        concept: isDaily ? 'daily_pass' : 'membership',
        amount: plan.price,
        method: Math.random() > 0.5 ? 'cash' : 'transfer',
        status: 'paid',
        registeredByUserId: user.id,
        createdAt: paymentDate,
      });
    }
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

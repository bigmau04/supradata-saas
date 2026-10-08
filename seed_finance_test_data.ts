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
  console.log('Starting seed...');
  
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
    name: 'Plan Mensual Prueba',
    durationDays: 30,
    price: '100000',
    description: 'Mensual test'
  }).returning();

  const [dailyPlan] = await db.insert(membershipPlans).values({
    gymId: gym.id,
    name: 'Pase Diario Prueba',
    durationDays: 1,
    price: '15000',
    description: 'Diario test'
  }).returning();

  // Create 8 Members
  const insertedMembers = [];
  for (let i = 1; i <= 8; i++) {
    const [m] = await db.insert(members).values({
      gymId: gym.id,
      documentId: 'SEED' + Math.floor(Math.random() * 1000000),
      fullName: 'Socio Prueba ' + i,
      phone: '300000000' + i,
      qrAccessToken: crypto.randomBytes(32).toString('hex')
    }).returning();
    insertedMembers.push(m);
  }

  const now = new Date();
  
  // 5 Active expiring soon
  for (let i = 0; i < 5; i++) {
    const m = insertedMembers[i];
    const end = new Date(now);
    end.setDate(now.getDate() + 2 + Math.floor(Math.random() * 3)); // 2 to 4 days
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    const [sub] = await db.insert(memberSubscriptions).values({
      gymId: gym.id,
      branchId: branch.id,
      memberId: m.id,
      planId: monthlyPlan.id,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      status: 'active'
    }).returning();
  }

  // 3 Expired
  for (let i = 5; i < 8; i++) {
    const m = insertedMembers[i];
    const end = new Date(now);
    end.setDate(now.getDate() - 5 - Math.floor(Math.random() * 6)); // 5 to 10 days ago
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    await db.insert(memberSubscriptions).values({
      gymId: gym.id,
      branchId: branch.id,
      memberId: m.id,
      planId: monthlyPlan.id,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      status: 'expired'
    });
  }

  // Insert Random Payments over last 7 days
  const concepts = ['membership', 'express', 'store'];
  const methods: ('cash' | 'transfer')[] = ['cash', 'transfer'];
  
  for (let i = 0; i < 15; i++) {
    const pDate = new Date(now);
    pDate.setHours(pDate.getHours() - Math.floor(Math.random() * 24 * 7)); // past 7 days
    
    const concept = concepts[Math.floor(Math.random() * concepts.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const amount = concept === 'membership' ? '100000' : concept === 'store' ? '5000' : '15000';

    await db.insert(payments).values({
      gymId: gym.id,
      branchId: branch.id,
      concept: concept,
      amount: amount,
      method: method,
      status: 'paid',
      registeredByUserId: user.id,
      createdAt: pDate,
      memberId: insertedMembers[Math.floor(Math.random() * insertedMembers.length)].id
    });
  }

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

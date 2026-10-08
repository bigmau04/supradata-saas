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

import { eq, like, or } from 'drizzle-orm';

async function clean() {
  const { db } = await import('./src/db');
  const { members, memberSubscriptions, payments, attendances } = await import('./src/db/schema');
  console.log('Starting cleanup of test data...');

  // Identify all test members
  const testMembers = await db.select().from(members).where(
    or(
      like(members.documentId, 'SEED%'),
      like(members.fullName, '%Prueba%'),
      like(members.fullName, '%Socio 3M%')
    )
  );

  console.log(`Found ${testMembers.length} test members to delete.`);

  if (testMembers.length === 0) {
    console.log('No test members found. Exiting.');
    process.exit(0);
  }

  const memberIds = testMembers.map((m: any) => m.id);

  // Delete attendances
  console.log('Deleting attendances...');
  for (const mId of memberIds) {
    await db.delete(attendances).where(eq(attendances.memberId, mId));
  }

  // Delete payments
  console.log('Deleting payments...');
  for (const mId of memberIds) {
    await db.delete(payments).where(eq(payments.memberId, mId));
  }

  // Delete subscriptions
  console.log('Deleting member subscriptions...');
  for (const mId of memberIds) {
    await db.delete(memberSubscriptions).where(eq(memberSubscriptions.memberId, mId));
  }

  // Delete members
  console.log('Deleting members...');
  for (const mId of memberIds) {
    await db.delete(members).where(eq(members.id, mId));
  }

  console.log('Cleanup completed successfully.');
  process.exit(0);
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});

import { db } from './src/db';
import { payments } from './src/db/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';

// Load .env.local
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/\r/g, '').replace(/^"|"$/g, '').trim();
  });
} catch(e) {}

async function run() {
  const chartDataRaw = await db.select({
    date: sql<string>`DATE(${payments.createdAt})`,
    total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS NUMERIC)), 0)`.mapWith(Number)
  }).from(payments)
  .groupBy(sql`DATE(${payments.createdAt})`)
  .orderBy(sql`DATE(${payments.createdAt})`);
  
  console.log('CHART DATA:', chartDataRaw);
  process.exit(0);
}
run();

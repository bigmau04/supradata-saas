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

async function run() {
  const { db } = await import('./src/db');
  const { gyms, appUsers } = await import('./src/db/schema');
  
  const allGyms = await db.select().from(gyms);
  console.log('GYMS:', allGyms);

  const users = await db.select().from(appUsers);
  console.log('USERS:', users);
  
  process.exit(0);
}
run();

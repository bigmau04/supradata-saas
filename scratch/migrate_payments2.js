const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS void_reason TEXT;`;
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES app_users(id);`;
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;`;
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();

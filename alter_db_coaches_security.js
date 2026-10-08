const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL;
    `;
    console.log('Members table altered successfully.');
  } catch(e) {
    console.error('Error altering members:', e.message);
  }

  try {
    await sql`
      ALTER TABLE coaches 
      ADD COLUMN IF NOT EXISTS is_clocked_in BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS last_clock_in TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS last_clock_out TIMESTAMP WITH TIME ZONE;
    `;
    console.log('Coaches table altered successfully.');
  } catch(e) {
    console.error('Error altering coaches:', e.message);
  }

  process.exit(0);
}

run();

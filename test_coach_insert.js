require('dotenv').config();
const postgres = require('postgres');

async function testInsert() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    const gyms = await sql`SELECT id FROM gyms LIMIT 1`;
    if (!gyms.length) {
      console.log('No gyms found to test insert.');
      return;
    }
    const gymId = gyms[0].id;

    console.log('Inserting test coach with gymId:', gymId);
    
    const result = await sql`
      INSERT INTO coaches (gym_id, full_name, document_id, phone, specialty, schedule_details, is_active, is_clocked_in)
      VALUES (${gymId}, 'Test Coach Script', '12345678', '555-0000', 'Test', 'Morning', true, false)
      RETURNING *;
    `;
    
    console.log('Success!', result[0]);
  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    await sql.end();
  }
}

testInsert();

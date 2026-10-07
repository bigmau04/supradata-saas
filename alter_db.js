const sql = require('postgres')('postgresql://postgres.epysxaipgtonrefnpniu:12358951753Moes.@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
sql`ALTER TABLE gyms ADD COLUMN tax_id VARCHAR(50)`.then(() => {
  console.log('Done');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

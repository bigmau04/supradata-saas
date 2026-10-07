const sql = require('postgres')('postgresql://postgres.epysxaipgtonrefnpniu:12358951753Moes.@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
sql`ALTER TABLE membership_plans ADD COLUMN description TEXT`.then(() => {
  console.log('Migration successful');
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(0);
});

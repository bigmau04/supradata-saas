const sql = require('postgres')('postgresql://postgres.epysxaipgtonrefnpniu:12358951753Moes.@aws-0-us-east-1.pooler.supabase.com:6543/postgres');

sql.begin(async sql => {
  // 1. Modificar payments
  await sql`ALTER TABLE payments ALTER COLUMN member_id DROP NOT NULL`;
  // Agregar columna concept si no existe. Usamos bloque anónimo para evitar error si ya existe.
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='concept') THEN
        ALTER TABLE payments ADD COLUMN concept VARCHAR(50) DEFAULT 'membership';
      END IF;
    END
    $$;
  `;
  
  // 2. Crear tabla products
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
}).then(() => {
  console.log('Migration successful');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

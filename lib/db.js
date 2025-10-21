import pkg from 'pg';
const { Pool } = pkg;

let pool;

export async function getPool() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // untuk Supabase port 5432 ini biasanya aman
    },
    max: 10,
  });

  return pool;
}

export async function query(text, params) {
  const p = await getPool();
  const res = await p.query(text, params);
  return res.rows;
}

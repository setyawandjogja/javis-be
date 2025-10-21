// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

let pool;

export async function getPool() {
  if (pool) return pool;

  const connectionString =
    process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;

  const isProduction = process.env.NODE_ENV === 'production';

  let sslConfig;

  if (connectionString?.includes('supabase')) {
    // Supabase selalu SSL, tapi self-signed di dev
    sslConfig = isProduction
      ? { rejectUnauthorized: true } // production: verifikasi sertifikat
      : { rejectUnauthorized: false }; // development: bypass self-signed
  } else {
    // fallback manual
    sslConfig = isProduction
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false };
  }

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: sslConfig,
      max: 10,
    });
  } else {
    pool = new Pool({
      host: process.env.POSTGRES_HOST ,
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD ,
      database: process.env.POSTGRES_DATABASE ,
      max: 10,
      ssl: sslConfig,
    });
  }

  return pool;
}

export async function query(text, params) {
  const p = await getPool();
  const res = await p.query(text, params);
  return res.rows;
}

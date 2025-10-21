// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

let pool;

export async function getPool() {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'javis',
    max: 10, // connection pool limit
  });

  return pool;
}

/**
 * Jalankan query ke PostgreSQL
 * @param {string} text SQL query
 * @param {Array} params parameter query
 */
export async function query(text, params) {
  const p = await getPool();
  const res = await p.query(text, params);
  return res.rows;
}

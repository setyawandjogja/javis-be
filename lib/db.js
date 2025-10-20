import mysql from 'mysql2/promise';

let pool;

export async function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
  });
  return pool;
}

export async function query(sql, params) {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'email and password required' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const rows = await query(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'invalid credentials' }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'invalid credentials' }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const jti = uuidv4();
    const token = signJwt({ sub: user.id, email: user.email, name: user.name, jti });

    // Simpan token ke cookie HttpOnly
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 jam
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

// Tambahkan untuk menangani preflight (CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// Fungsi helper CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:5173', // frontend React
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

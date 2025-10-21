import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const rows = await query(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    const token = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      jti: uuidv4()
    });

    // ✅ Perbaikan secure + cookie agar bisa tersimpan
    cookies().set('token', token, {
      httpOnly: true,
      secure: false, // <-- WAJIB FALSE di localhost
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

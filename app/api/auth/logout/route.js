import { serialize } from 'cookie';

export async function POST() {
  try {
    const clearCookie = serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'local',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Set-Cookie': clearCookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Logout error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders(),
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
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

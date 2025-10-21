import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function rateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

  if (now - attempts.lastAttempt < WINDOW_MS) {
    attempts.count++;
  } else {
    attempts.count = 1;
  }
  attempts.lastAttempt = now;
  loginAttempts.set(ip, attempts);

  return attempts.count <= MAX_ATTEMPTS;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, Accept",
  };
}

export async function POST(req) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.ip ||
      "unknown";

    if (!rateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many login attempts. Try again later." }),
        { status: 429, headers: corsHeaders() }
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // ✅ PostgreSQL query dengan schema "user"
    const rows = await query(
      'SELECT id, email, password_hash, name FROM "javis".users WHERE email = $1',
      [email]
    );

    if (!rows.length) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: corsHeaders() }
      );
    }

    loginAttempts.delete(ip);

    const token = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      jti: uuidv4(),
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: false, // must false for localhost
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return new Response(JSON.stringify({ ok: true, token }), {
      status: 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

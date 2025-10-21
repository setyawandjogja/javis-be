import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
  try {
    // ✅ Ambil cookie dengan cara aman
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: "No token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Verifikasi JWT
    const payload = verifyJwt(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ BERHASIL
    return new Response(
      JSON.stringify({
        ok: true,
        user: { id: payload.sub, email: payload.email, name: payload.name },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("ERROR /api/auth/me:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

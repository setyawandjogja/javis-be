import { NextResponse } from "next/server";

const allowedOrigin = "http://localhost:5173";

export function middleware(req) {
  const origin = req.headers.get("origin");
  const isAllowedOrigin = origin === allowedOrigin;

  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin) response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, Accept");
    return response;
  }

  const res = NextResponse.next();
  if (isAllowedOrigin) res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  return res;
}

export const config = { matcher: "/api/:path*" };

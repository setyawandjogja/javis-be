import cookie from 'cookie';
import { verifyJwt } from '@/lib/jwt';

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: 'no token' });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: 'invalid token' });
  return res.json({ ok: true, user: { id: payload.sub, email: payload.email, name: payload.name } });
}

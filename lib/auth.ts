import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from './prisma';
import type { Role } from '@prisma/client';
const COOKIE = 'hoteldesk_session';
function secret() { const s = process.env.AUTH_SECRET; if (!s || s.length < 32) throw new Error('AUTH_SECRET deve ter ao menos 32 caracteres'); return s; }
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('hex'); }
export async function createSession(userId: string) {
 const payload = `${userId}.${Date.now() + 7 * 86400000}`;
 const jar = await cookies(); jar.set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 86400 });
}
export async function destroySession() { (await cookies()).delete(COOKIE); }
export async function currentUser() {
 const value = (await cookies()).get(COOKIE)?.value;
 if (!value) return null;
 const parts = value.split('.'); if (parts.length !== 3) return null;
 const [id, expires, signature] = parts; const payload = `${id}.${expires}`;
 const expected = sign(payload);
 if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) || Number(expires) < Date.now()) return null;
 return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
}
export async function requireRole(...roles: Role[]) {
 const user = await currentUser();
 if (!user) throw new Error('UNAUTHENTICATED');
 if (roles.length && !roles.includes(user.role)) throw new Error('FORBIDDEN');
 return user;
}

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db';

/**
 * Authentication Decision:
 * We chose email and password with salted bcrypt hashing because it runs self-contained
 * without requiring external SMTP credentials, email delivery infrastructure, or third-party
 * email APIs that fail in offline or containerized environments. It provides instant,
 * deterministic sign-up and sign-in while securing passwords with high-cost cryptographic
 * salting, and pairs seamlessly with httpOnly session cookies.
 */

export const SESSION_COOKIE_NAME = 'swlp_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'swlp-secret-key-production-hardened-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Generates an HMAC-signed session token containing userId and expiration.
 */
export function signToken(userId: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verifies an HMAC-signed session token.
 */
export function verifyToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${userId}.${expiresAtStr}`)
    .digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return userId;
  }
  return null;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function setSessionCookie(res: Response, userId: string): void {
  const token = signToken(userId);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Express middleware requiring authentication.
 * Returns RFC 9457 Problem Details on missing or invalid session.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const userId = verifyToken(token);

  if (!userId) {
    res.status(401).type('application/problem+json').json({
      type: 'https://datatracker.ietf.org/doc/html/rfc9457',
      title: 'Unauthorized',
      status: 401,
      detail: 'You must be signed in to access this resource.',
      instance: req.originalUrl,
    });
    return;
  }

  const row = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId) as
    | { id: string; email: string }
    | undefined;

  if (!row) {
    clearSessionCookie(res);
    res.status(401).type('application/problem+json').json({
      type: 'https://datatracker.ietf.org/doc/html/rfc9457',
      title: 'Unauthorized',
      status: 401,
      detail: 'User session is invalid or user was deleted.',
      instance: req.originalUrl,
    });
    return;
  }

  req.user = { id: row.id, email: row.email };
  next();
}

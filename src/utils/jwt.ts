/**
 * JWT utilities using Hono's built-in JWT functionality
 * Compatible with Cloudflare Workers runtime
 */
import { sign, verify } from 'hono/jwt';

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Sign a JWT token
 */
export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds: number = 86400, // 24 hours
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  return await sign(fullPayload as any, secret);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(
  token: string,
  secret: string,
): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret, 'HS256') as unknown as JWTPayload;

    // Check expiration (Hono's verify should handle this, but double-check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

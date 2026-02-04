import { Context, Next, MiddlewareHandler } from 'hono';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { Env } from './db';

/**
 * Authentication middleware
 * Verifies JWT from Authorization header and attaches user info to context
 */
export function authMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json(
        { success: false, error: 'Authorization header required' },
        401,
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: 'Invalid authorization format. Use: Bearer <token>',
        },
        401,
      );
    }

    const token = authHeader.slice(7);

    if (!token) {
      return c.json({ success: false, error: 'Token required' }, 401);
    }

    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);

    await next();
  };
}

export type { Env };

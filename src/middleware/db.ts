import { Context, Next, MiddlewareHandler } from 'hono';
import { connect } from '../db/client';

// Type for the connected database
type MondelDB = Awaited<ReturnType<typeof connect>>;

export interface Env {
  MONGODB_URI: string;
  JWT_SECRET: string;
}

// Extend Hono's context to include our custom variables
declare module 'hono' {
  interface ContextVariableMap {
    db: MondelDB;
    userId: string;
    userEmail: string;
    validatedBody: unknown;
    validatedQuery: unknown;
    validatedParams: unknown;
  }
}

/**
 * Database middleware
 * Connects to MongoDB and attaches db client to context
 */
export function dbMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const db = await connect(c.env.MONGODB_URI);
    c.set('db', db);
    await next();
  };
}

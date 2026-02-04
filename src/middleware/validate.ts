import { Context, Next, MiddlewareHandler } from 'hono';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Format Zod validation errors into a clean response
 */
function formatZodErrors(error: ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validation middleware factory for request body
 */
export function validateBody<T extends ZodSchema>(
  schema: T,
): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}));
    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(result.error),
        },
        400,
      );
    }

    c.set('validatedBody', result.data);
    await next();
  };
}

/**
 * Validation middleware factory for query parameters
 */
export function validateQuery<T extends ZodSchema>(
  schema: T,
): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Query validation failed',
          details: formatZodErrors(result.error),
        },
        400,
      );
    }

    c.set('validatedQuery', result.data);
    await next();
  };
}

/**
 * Validation middleware factory for URL parameters
 */
export function validateParams<T extends ZodSchema>(
  schema: T,
): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Parameter validation failed',
          details: formatZodErrors(result.error),
        },
        400,
      );
    }

    c.set('validatedParams', result.data);
    await next();
  };
}

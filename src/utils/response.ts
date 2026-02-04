import { Context } from 'hono';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Options for the tryCatch wrapper
 */
export interface TryCatchOptions {
  errorMessage?: string;
  logPrefix?: string;
}

/**
 * Try-catch wrapper for async route handlers
 */
export async function tryCatch<T>(
  c: Context,
  fn: () => Promise<T>,
  options: TryCatchOptions = {},
): Promise<Response | T> {
  const { errorMessage = 'An error occurred', logPrefix = 'Error' } = options;

  try {
    return await fn();
  } catch (error) {
    console.error(`${logPrefix}:`, error);
    return c.json(
      {
        success: false,
        error: errorMessage,
        ...(error instanceof Error && { message: error.message }),
      },
      500,
    );
  }
}

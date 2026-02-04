import { z } from 'zod';

/**
 * Create todo validation schema
 */
export const createTodoSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().optional().default(''),
  completed: z.boolean().optional().default(false),
});

/**
 * Update todo validation schema (all fields optional)
 */
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

/**
 * Todo ID parameter validation
 */
export const todoIdSchema = z.object({
  id: z.string().min(1, 'Todo ID is required'),
});

/**
 * Query parameters for listing todos
 */
export const listTodosQuerySchema = z.object({
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) =>
      val === 'true' ? true : val === 'false' ? false : undefined,
    ),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  skip: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
});

// Type exports
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoIdParams = z.infer<typeof todoIdSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;

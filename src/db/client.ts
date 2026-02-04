import { createClient } from 'mondel';
import { userSchema } from './schemas/user.schema';
import { todoSchema } from './schemas/todo.schema';

/**
 * Create the Mondel client factory
 * This is lightweight and doesn't connect until called
 */
export const connect = createClient({
  serverless: true,
  schemas: [userSchema, todoSchema],
  validation: 'strict',
});

export { userSchema, todoSchema };

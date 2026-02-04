import { Context } from 'hono';
import { ObjectId } from 'mongodb';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validations/auth.validation';
import { tryCatch } from '../utils/response';
import { Env } from '../middleware/db';

/**
 * Register a new user
 */
export async function register(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const body = c.get('validatedBody') as RegisterInput;
      const db = c.get('db');

      const existingUser = await db.users.findOne({ email: body.email });
      if (existingUser) {
        return c.json(
          { success: false, error: 'User with this email already exists' },
          409,
        );
      }

      const hashedPassword = await hashPassword(body.password);

      const result = await db.users.create({
        email: body.email,
        password: hashedPassword,
        name: body.name,
      });

      const token = await signToken(
        { userId: result.insertedId.toString(), email: body.email },
        c.env.JWT_SECRET,
      );

      return c.json(
        {
          success: true,
          data: {
            user: {
              id: result.insertedId.toString(),
              email: body.email,
              name: body.name,
            },
            token,
          },
        },
        201,
      );
    },
    { errorMessage: 'Registration failed', logPrefix: 'Registration error' },
  ) as Promise<Response>;
}

/**
 * Login user
 */
export async function login(c: Context<{ Bindings: Env }>): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const body = c.get('validatedBody') as LoginInput;
      const db = c.get('db');

      const user = await db.users.findOne({ email: body.email });
      if (!user) {
        return c.json(
          { success: false, error: 'Invalid email or password' },
          401,
        );
      }

      const isValid = await verifyPassword(
        body.password,
        user.password as string,
      );
      if (!isValid) {
        return c.json(
          { success: false, error: 'Invalid email or password' },
          401,
        );
      }

      const token = await signToken(
        { userId: user._id.toString(), email: user.email as string },
        c.env.JWT_SECRET,
      );

      return c.json({
        success: true,
        data: {
          user: { id: user._id.toString(), email: user.email, name: user.name },
          token,
        },
      });
    },
    { errorMessage: 'Login failed', logPrefix: 'Login error' },
  ) as Promise<Response>;
}

/**
 * Get current user
 */
export async function getCurrentUser(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');

      const user = await db.users.findById(userId, {
        select: { email: true, name: true, createdAt: true },
      });

      if (!user) {
        return c.json({ success: false, error: 'User not found' }, 404);
      }

      return c.json({
        success: true,
        data: {
          id: userId,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    },
    { errorMessage: 'Failed to get user', logPrefix: 'Get user error' },
  ) as Promise<Response>;
}

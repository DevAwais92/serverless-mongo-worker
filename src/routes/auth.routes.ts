import { Hono } from 'hono';
import { Env } from '../middleware/db';
import { validateBody } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import * as authController from '../controllers/auth.controller';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /auth/register
 */
auth.post('/register', validateBody(registerSchema), authController.register);

/**
 * POST /auth/login
 */
auth.post('/login', validateBody(loginSchema), authController.login);

/**
 * GET /auth/me
 */
auth.get('/me', authMiddleware(), authController.getCurrentUser);

export default auth;

import { Hono } from 'hono';
import { Env } from '../middleware/db';
import authRoutes from './auth.routes';
import todoRoutes from './todo.routes';

/**
 * Route configuration
 */
interface RouteConfig {
  path: string;
  router: Hono<{ Bindings: Env }>;
}

/**
 * Array of all API routes
 */
export const routes: RouteConfig[] = [
  { path: '/auth', router: authRoutes },
  { path: '/todos', router: todoRoutes },
];

/**
 * Mount all routes to the app with given prefix
 */
export function mountRoutes(
  app: Hono<{ Bindings: Env }>,
  prefix: string = '/v1',
): void {
  for (const route of routes) {
    app.route(`${prefix}${route.path}`, route.router);
  }
}

export default routes;

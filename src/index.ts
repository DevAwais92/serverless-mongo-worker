import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env, dbMiddleware } from './middleware/db';
import { routes, mountRoutes } from './routes';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Mondel Worker Todo API',
    version: '1.0.0',
    endpoints: { v1: routes.map((r) => `/v1${r.path}`) },
  });
});

app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Apply db middleware to v1 routes
app.use('/v1/*', dbMiddleware());

// Mount API routes
mountRoutes(app);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found', path: c.req.path }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    { success: false, error: 'Internal server error', message: err.message },
    500,
  );
});

export default app;

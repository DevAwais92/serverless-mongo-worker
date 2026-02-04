import { Hono } from 'hono';
import { Env } from '../middleware/db';
import { authMiddleware } from '../middleware/auth';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate';
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdSchema,
  listTodosQuerySchema,
} from '../validations/todo.validation';
import * as todoController from '../controllers/todo.controller';

const todos = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
todos.use('/*', authMiddleware());

/**
 * POST /todos
 */
todos.post('/', validateBody(createTodoSchema), todoController.createTodo);

/**
 * GET /todos
 */
todos.get('/', validateQuery(listTodosQuerySchema), todoController.listTodos);

/**
 * GET /todos/:id
 */
todos.get('/:id', validateParams(todoIdSchema), todoController.getTodoById);

/**
 * PUT /todos/:id
 */
todos.put(
  '/:id',
  validateParams(todoIdSchema),
  validateBody(updateTodoSchema),
  todoController.updateTodo,
);

/**
 * DELETE /todos/:id
 */
todos.delete('/:id', validateParams(todoIdSchema), todoController.deleteTodo);

export default todos;

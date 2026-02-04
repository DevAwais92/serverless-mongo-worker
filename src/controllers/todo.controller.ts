import { Context } from 'hono';
import { ObjectId } from 'mongodb';
import {
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosQuery,
} from '../validations/todo.validation';
import { tryCatch } from '../utils/response';
import { Env } from '../middleware/db';

/**
 * Create a new todo
 */
export async function createTodo(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');
      const body = c.get('validatedBody') as CreateTodoInput;

      const result = await db.todos.create({
        title: body.title,
        description: body.description || '',
        completed: body.completed || false,
        userId: new ObjectId(userId),
      });

      return c.json(
        {
          success: true,
          data: {
            id: result.insertedId.toString(),
            title: body.title,
            description: body.description || '',
            completed: body.completed || false,
            userId: userId,
          },
        },
        201,
      );
    },
    { errorMessage: 'Failed to create todo', logPrefix: 'Create todo error' },
  ) as Promise<Response>;
}

/**
 * List todos for a user
 */
export async function listTodos(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');
      const query = c.get('validatedQuery') as ListTodosQuery;

      const filter: Record<string, unknown> = { userId: new ObjectId(userId) };
      if (query.completed !== undefined) filter.completed = query.completed;

      const todosList = await db.todos.findMany(filter);
      const paginatedTodos = todosList.slice(
        query.skip,
        query.skip + query.limit,
      );

      return c.json({
        success: true,
        data: paginatedTodos.map((todo: (typeof todosList)[number]) => ({
          id: todo._id.toString(),
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        })),
        pagination: {
          total: todosList.length,
          limit: query.limit,
          skip: query.skip,
        },
      });
    },
    { errorMessage: 'Failed to list todos', logPrefix: 'List todos error' },
  ) as Promise<Response>;
}

/**
 * Get a single todo by ID
 */
export async function getTodoById(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');
      const { id } = c.get('validatedParams') as { id: string };

      const todo = await db.todos.findById(id);
      if (!todo)
        return c.json({ success: false, error: 'Todo not found' }, 404);

      if ((todo.userId as { toString(): string }).toString() !== userId) {
        return c.json(
          { success: false, error: 'Not authorized to access this todo' },
          403,
        );
      }

      return c.json({
        success: true,
        data: {
          id: todo._id.toString(),
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        },
      });
    },
    { errorMessage: 'Failed to get todo', logPrefix: 'Get todo error' },
  ) as Promise<Response>;
}

/**
 * Update a todo
 */
export async function updateTodo(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');
      const { id } = c.get('validatedParams') as { id: string };
      const body = c.get('validatedBody') as UpdateTodoInput;

      const todo = await db.todos.findById(id);
      if (!todo)
        return c.json({ success: false, error: 'Todo not found' }, 404);

      if ((todo.userId as { toString(): string }).toString() !== userId) {
        return c.json(
          { success: false, error: 'Not authorized to update this todo' },
          403,
        );
      }

      const updateFields: Record<string, unknown> = {};
      if (body.title !== undefined) updateFields.title = body.title;
      if (body.description !== undefined)
        updateFields.description = body.description;
      if (body.completed !== undefined) updateFields.completed = body.completed;

      await db.todos.updateById(id, { $set: updateFields });
      const updatedTodo = await db.todos.findById(id);

      return c.json({
        success: true,
        data: {
          id: updatedTodo!._id.toString(),
          title: updatedTodo!.title,
          description: updatedTodo!.description,
          completed: updatedTodo!.completed,
          createdAt: updatedTodo!.createdAt,
          updatedAt: updatedTodo!.updatedAt,
        },
      });
    },
    { errorMessage: 'Failed to update todo', logPrefix: 'Update todo error' },
  ) as Promise<Response>;
}

/**
 * Delete a todo
 */
export async function deleteTodo(
  c: Context<{ Bindings: Env }>,
): Promise<Response> {
  return tryCatch(
    c,
    async () => {
      const db = c.get('db');
      const userId = c.get('userId');
      const { id } = c.get('validatedParams') as { id: string };

      const todo = await db.todos.findById(id);
      if (!todo)
        return c.json({ success: false, error: 'Todo not found' }, 404);

      if ((todo.userId as { toString(): string }).toString() !== userId) {
        return c.json(
          { success: false, error: 'Not authorized to delete this todo' },
          403,
        );
      }

      await db.todos.deleteById(id);
      return c.body(null, 204);
    },
    { errorMessage: 'Failed to delete todo', logPrefix: 'Delete todo error' },
  ) as Promise<Response>;
}

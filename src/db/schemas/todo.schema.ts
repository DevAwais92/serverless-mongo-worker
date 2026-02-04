import { defineSchema, s } from 'mondel';

/**
 * Todo schema with user reference
 */
export const todoSchema = defineSchema('todos', {
  timestamps: true,
  fields: {
    title: s.string().required(),
    description: s.string().default(''),
    completed: s.boolean().default(false),
    userId: s.objectId().required(),
  },
});

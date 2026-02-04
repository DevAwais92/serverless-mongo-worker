import { defineSchema, s } from 'mondel';

/**
 * User schema for authentication
 */
export const userSchema = defineSchema('users', {
  timestamps: true,
  fields: {
    email: s.string().required(),
    password: s.string().required(),
    name: s.string().required(),
  },
});

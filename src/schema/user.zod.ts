import { z } from 'zod';

export const UserZodSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'admin', 'supervisor']).optional(),
});


export const UserUpdateZodSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['student', 'admin', 'supervisor']).optional(),
});
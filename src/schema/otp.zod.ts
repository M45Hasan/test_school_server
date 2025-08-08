import { z } from 'zod';

const OTPZodSchema = z.object({
  user: z.string().min(1, 'User ID required'),
  code: z.string().length(6),
  type: z.enum(['email', 'sms']),
  expiresAt: z.date().optional().default(() => new Date(Date.now() + 900000)), 
  isUsed: z.boolean().default(false),
  attemptCount: z.number().min(0).default(0),
  lastAttemptAt: z.date().optional()
});
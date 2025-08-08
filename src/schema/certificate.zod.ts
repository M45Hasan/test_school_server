import { z } from 'zod';

const CertificateZodSchema = z.object({
  user: z.string().min(1, 'User ID required'),
  testAttempt: z.string().min(1, 'TestAttempt ID required'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  issuedAt: z.date().optional().default(() => new Date()),
  expiresAt: z.date().optional(),
  pdfUrl: z.string().url().optional(),
  verificationCode: z.string().optional()
});
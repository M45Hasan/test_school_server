import { z } from 'zod';

export const QuestionZodSchema = z.object({
  text: z.string().min(10),
  competency: z.string().min(3),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  options: z.array(z.string().min(1)).length(4), 
  correctAnswer: z.string().min(1),
  timeLimit: z.number().min(30).max(300).optional() 
}).partial();


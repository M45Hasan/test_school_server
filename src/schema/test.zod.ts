import { z } from 'zod';

const stepToLevels = {
  1: ['A1', 'A2'],
  2: ['B1', 'B2'],
  3: ['C1', 'C2']
} as const;

export const TestZodSchema = z.object({
  step: z.enum(['1', '2', '3']).transform(Number),
  levelsCovered: z.array(z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']))
    .length(2),
  totalQuestions: z.number().multipleOf(2).default(44),
  passingThreshold: z.number().min(0).max(100).default(25),
  duration: z.number().min(5).max(180), 
  isActive: z.boolean().default(true)
})
.superRefine((obj, ctx) => {
  const expectedLevels = stepToLevels[obj.step as keyof typeof stepToLevels];
  if (JSON.stringify([...obj.levelsCovered].sort()) !== JSON.stringify([...expectedLevels].sort())) {
    ctx.addIssue({
      path: ['levelsCovered'],
      code: z.ZodIssueCode.custom,
      message: 'Levels must match step: Step 1 → A1/A2, Step 2 → B1/B2, Step 3 → C1/C2'
    });
  }
});
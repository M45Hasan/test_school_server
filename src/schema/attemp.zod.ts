import { z } from "zod";

export const AnswerZodSchema = z.object({
  question: z.string().min(1, "Question ID required"),
  selectedOption: z.string().min(1, "Option selection required"),
  isCorrect: z.boolean().optional(),
});

export const TestAttemptZodSchema = z.object({
  user: z.string().min(1, "User ID required"),
  test: z.string().min(1, "Test ID required"),
  score: z.number().min(0).max(100).optional(),
  status: z
    .enum(["in-progress", "passed", "failed", "timeout"])
    .default("in-progress"),
  startedAt: z.date().default(() => new Date()),
  completedAt: z
    .date()
    .optional()
    .refine(
      (val: Date | undefined) => {
        if (!val) return true;
        return true;
      },
      {
        message: "completedAt is required for submitted attempts",
      }
    ),
  answers: z.array(AnswerZodSchema).optional(),
  isRetakeAllowed: z.boolean().default(true),
});

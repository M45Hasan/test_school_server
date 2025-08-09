"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAttemptZodSchema = exports.AnswerZodSchema = void 0;
const zod_1 = require("zod");
exports.AnswerZodSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Question ID required"),
    selectedOption: zod_1.z.string().min(1, "Option selection required"),
    isCorrect: zod_1.z.boolean().optional(),
});
exports.TestAttemptZodSchema = zod_1.z.object({
    user: zod_1.z.string().min(1, "User ID required"),
    test: zod_1.z.string().min(1, "Test ID required"),
    score: zod_1.z.number().min(0).max(100).optional(),
    status: zod_1.z
        .enum(["in-progress", "passed", "failed", "timeout", "completed"])
        .default("in-progress"),
    startedAt: zod_1.z.date().default(() => new Date()),
    completedAt: zod_1.z
        .date()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return true;
    }, {
        message: "completedAt is required for submitted attempts",
    }),
    answers: zod_1.z.array(exports.AnswerZodSchema).optional(),
    isRetakeAllowed: zod_1.z.boolean().default(true),
});

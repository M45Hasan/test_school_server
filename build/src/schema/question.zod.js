"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionZodSchema = void 0;
const zod_1 = require("zod");
exports.QuestionZodSchema = zod_1.z.object({
    text: zod_1.z.string().min(10),
    competency: zod_1.z.string().min(3),
    level: zod_1.z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    options: zod_1.z.array(zod_1.z.string().min(1)).length(4),
    correctAnswer: zod_1.z.string().min(1),
    timeLimit: zod_1.z.number().min(30).max(300).optional()
}).partial();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const OTPZodSchema = zod_1.z.object({
    user: zod_1.z.string().min(1, 'User ID required'),
    code: zod_1.z.string().length(6),
    type: zod_1.z.enum(['email', 'sms']),
    expiresAt: zod_1.z.date().optional().default(() => new Date(Date.now() + 900000)),
    isUsed: zod_1.z.boolean().default(false),
    attemptCount: zod_1.z.number().min(0).default(0),
    lastAttemptAt: zod_1.z.date().optional()
});

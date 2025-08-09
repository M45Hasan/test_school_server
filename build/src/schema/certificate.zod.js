"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CertificateZodSchema = zod_1.z.object({
    user: zod_1.z.string().min(1, 'User ID required'),
    testAttempt: zod_1.z.string().min(1, 'TestAttempt ID required'),
    level: zod_1.z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    issuedAt: zod_1.z.date().optional().default(() => new Date()),
    expiresAt: zod_1.z.date().optional(),
    pdfUrl: zod_1.z.string().url().optional(),
    verificationCode: zod_1.z.string().optional()
});

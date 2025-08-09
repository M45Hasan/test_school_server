"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdateZodSchema = exports.UserZodSchema = void 0;
const zod_1 = require("zod");
exports.UserZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['student', 'admin', 'supervisor']).optional(),
});
exports.UserUpdateZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).optional(),
    userId: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(['student', 'admin', 'supervisor']).optional(),
});

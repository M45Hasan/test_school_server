"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestZodSchema = void 0;
const zod_1 = require("zod");
const stepToLevels = {
    1: ["A1", "A2"],
    2: ["B1", "B2"],
    3: ["C1", "C2"],
};
exports.TestZodSchema = zod_1.z
    .object({
    step: zod_1.z.enum(["1", "2", "3"]).transform(Number),
    levelsCovered: zod_1.z
        .array(zod_1.z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]))
        .length(2),
    totalQuestions: zod_1.z.number().multipleOf(2).default(44),
    passingThreshold: zod_1.z.number().min(0).max(100).default(25),
    duration: zod_1.z.number().min(2).max(180),
    isActive: zod_1.z.boolean().default(true),
})
    .partial()
    .superRefine((obj, ctx) => {
    const expectedLevels = stepToLevels[obj.step];
    if (obj.levelsCovered &&
        JSON.stringify([...obj.levelsCovered].sort()) !==
            JSON.stringify([...expectedLevels].sort())) {
        ctx.addIssue({
            path: ["levelsCovered"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "Levels must match step: Step 1 → A1/A2, Step 2 → B1/B2, Step 3 → C1/C2",
        });
    }
});

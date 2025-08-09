"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const TestSchema = new mongoose_1.Schema({
    step: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
        unique: true,
    },
    levelsCovered: {
        type: [String],
        enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
        required: true,
        validate: {
            validator: function (levels) {
                const stepToLevels = {
                    1: ["A1", "A2"],
                    2: ["B1", "B2"],
                    3: ["C1", "C2"],
                };
                return (JSON.stringify([...levels].sort()) ===
                    JSON.stringify(stepToLevels[this.step].sort()));
            },
            message: "Levels must match the step: Step 1 → A1/A2, Step 2 → B1/B2, Step 3 → C1/C2",
        },
    },
    totalQuestions: {
        type: Number,
        default: 44,
        validate: [
            (v) => v % 2 === 0,
            "Questions must be even for level balance",
        ],
    },
    passingThreshold: {
        type: Number,
        default: 25,
        min: 0,
        max: 100,
    },
    duration: {
        type: Number,
        required: true,
        min: 2, // min
        max: 180,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
TestSchema.plugin(mongoose_paginate_v2_1.default);
exports.Test = (0, mongoose_1.model)("Test", TestSchema);

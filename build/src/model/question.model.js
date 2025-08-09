"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const QuestionSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    competency: { type: String, required: true },
    level: {
        type: String,
        enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
        required: true,
    },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    timeLimit: { type: Number, default: 60 },
}, { timestamps: true });
QuestionSchema.plugin(mongoose_paginate_v2_1.default);
const Question = (0, mongoose_1.model)("Question", QuestionSchema);
exports.default = Question;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionsForAttempt_s = void 0;
// services/attempt.service.ts
const attem_model_1 = require("../../model/attem.model");
const customError_1 = require("../../error/customError");
const question_model_1 = __importDefault(require("../../model/question.model"));
const getQuestionsForAttempt_s = async (attemptId, userId) => {
    // 1. Validate attempt exists and belongs to user
    const attempt = await attem_model_1.TestAttempt.findOne({
        _id: attemptId,
        user: userId,
        status: "in-progress",
    }).populate({
        path: "test",
        select: "levelsCovered totalQuestions duration",
    });
    if (!attempt) {
        throw new customError_1.BadRequestError("Attempt not found or already submitted");
    }
    const test = attempt.test;
    // 2. Check time remaining
    const elapsedMinutes = (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
    const timeLeft = test.duration - elapsedMinutes;
    if (timeLeft <= 0) {
        await attem_model_1.TestAttempt.findByIdAndUpdate(attemptId, {
            status: "timeout",
            completedAt: new Date(),
        });
        throw new customError_1.BadRequestError("Time expired");
    }
    // 3. Get questions
    if (attempt.answers.length === 0) {
        const questions = await question_model_1.default.aggregate([
            {
                $match: {
                    level: { $in: test.levelsCovered },
                },
            },
            { $sample: { size: test.totalQuestions } },
            {
                $project: {
                    text: 1,
                    options: 1,
                    timeLimit: 1,
                    competency: 1,
                    _id: 1,
                },
            },
        ]);
        // Store question references
        await attem_model_1.TestAttempt.findByIdAndUpdate(attemptId, {
            $set: {
                answers: questions.map((q) => ({
                    question: q._id,
                    selectedOption: "",
                })),
            },
        });
        return {
            questions,
            timeLeft: Math.floor(timeLeft),
            attemptId,
        };
    }
    // 4. Load existing questions
    const questions = await question_model_1.default.find({
        _id: { $in: attempt.answers.map((a) => a.question) },
    }).select("-correctAnswer");
    return {
        questions,
        timeLeft: Math.floor(timeLeft),
        attemptId,
    };
};
exports.getQuestionsForAttempt_s = getQuestionsForAttempt_s;

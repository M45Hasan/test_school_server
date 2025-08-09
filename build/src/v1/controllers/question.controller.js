"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionsForAttempt = exports.getQuestionsByLevel = exports.getQuestions = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = void 0;
const question_model_1 = __importDefault(require("../../model/question.model"));
const customError_1 = require("../../error/customError");
const tryCatch_1 = require("../../utils/tryCatch");
const question_zod_1 = require("../../schema/question.zod");
const appStatus_1 = __importDefault(require("../../utils/appStatus"));
const attem_model_1 = require("../../model/attem.model");
// Create Question (Admin)
exports.createQuestion = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const validation = question_zod_1.QuestionZodSchema.parse(req.body);
    if (!validation) {
        return next(new customError_1.BadRequestError("Invalid question data"));
    }
    // duplicate check
    const existingQuestion = await question_model_1.default.findOne({
        text: validation.text,
        level: validation.level,
        competency: validation.competency,
    });
    if (existingQuestion) {
        return next(new customError_1.BadRequestError("Question already exists"));
    }
    const question = new question_model_1.default(validation);
    await question.save();
    (0, appStatus_1.default)(201, "Question created successfully", req, res);
});
// Update (Admin)
exports.updateQuestion = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const validation = question_zod_1.QuestionZodSchema.parse(req.body);
    if (!validation) {
        return next(new customError_1.BadRequestError("validation failed"));
    }
    const question = await question_model_1.default.findByIdAndUpdate(id, validation, {
        new: true,
    });
    if (!question) {
        return next(new customError_1.BadRequestError("Question not found"));
    }
    (0, appStatus_1.default)(200, question, req, res);
});
// delete Question (Admin)
exports.deleteQuestion = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const question = await question_model_1.default.findByIdAndDelete(id);
    if (!question) {
        return next(new customError_1.BadRequestError("Question not found"));
    }
    (0, appStatus_1.default)(200, "Question deleted successfully", req, res);
});
// Get All
exports.getQuestions = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const options = {
        page,
        limit,
        sort: { createdAt: -1 },
    };
    const result = await question_model_1.default.paginate({}, options);
    (0, appStatus_1.default)(200, result, req, res);
});
// Get Questions by Level
exports.getQuestionsByLevel = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const options = {
        page,
        limit,
        sort: { createdAt: -1 },
    };
    const { level } = req.params;
    const query = { level };
    const questions = await question_model_1.default.paginate(query, options);
    (0, appStatus_1.default)(200, questions, req, res);
});
exports.getQuestionsForAttempt = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { attemptId } = req.params;
    const userId = req.user._id;
    // 1. Validate attempt exists and belongs to user
    const attempt = await attem_model_1.TestAttempt.findOne({
        _id: attemptId,
        user: userId,
        status: "in-progress",
    }).populate({
        path: "test",
        select: "levelsCovered totalQuestions duration",
    }).populate({ path: "user", select: "-password -__v -createdAt -updatedAt" });
    if (!attempt) {
        return next(new customError_1.BadRequestError(attempt ? "Attempt already submitted" : "Invalid attempt ID"));
    }
    // 2. Check time remaining
    const elapsedMinutes = (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
    const timeLeft = attempt.test.duration - elapsedMinutes;
    if (timeLeft <= 0) {
        await attem_model_1.TestAttempt.findByIdAndUpdate(attemptId, {
            status: "timeout",
            completedAt: new Date(),
        });
        return next(new customError_1.BadRequestError("Time expired"));
    }
    // 3. Get questions 
    if (attempt.answers.length === 0) {
        const questions = await question_model_1.default.aggregate([
            {
                $match: {
                    level: { $in: attempt.test.levelsCovered },
                },
            },
            { $sample: { size: attempt.test.totalQuestions } },
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
        (0, appStatus_1.default)(200, {
            questions,
            timeLeft: Math.floor(timeLeft),
        }, req, res);
        return;
    }
    // 4. loaded questions
    const questions = await question_model_1.default.find({
        _id: { $in: attempt.answers.map((a) => a.question) },
    }).select("-correctAnswer");
    (0, appStatus_1.default)(200, {
        user: req.user,
        questions,
        timeLeft: Math.floor(timeLeft),
    }, req, res);
});

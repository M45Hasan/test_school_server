"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttempt = exports.submitAttempt = exports.startAttempt = void 0;
const attem_model_1 = require("../../model/attem.model");
const test_model_1 = require("../../model/test.model");
const question_model_1 = __importDefault(require("../../model/question.model"));
const customError_1 = require("../../error/customError");
const tryCatch_1 = require("../../utils/tryCatch");
const appStatus_1 = __importDefault(require("../../utils/appStatus"));
const attempt_service_1 = require("../services/attempt.service");
// new test attempt
exports.startAttempt = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { testId } = req.params;
    const userId = req.user._id;
    // Check active attempt
    const existingAttempt = await attem_model_1.TestAttempt.findOne({
        user: userId,
        test: testId,
        status: "in-progress",
    });
    if (existingAttempt) {
        return next(new customError_1.BadRequestError("You already have an active attempt"));
    }
    // Check retake permission for failed Step 1
    if (await isStep1Failed(userId)) {
        return next(new customError_1.Unauthorized("Retake not allowed for failed Step 1"));
    }
    const attempt = new attem_model_1.TestAttempt({
        user: userId,
        test: testId,
    });
    const mx = await attempt.save();
    // Get questions for the new attempt
    const attemptData = await (0, attempt_service_1.getQuestionsForAttempt_s)(mx._id.toString(), userId);
    (0, appStatus_1.default)(201, {
        user: req.user,
        attempt,
        questions: attemptData.questions,
        timeLeft: attemptData.timeLeft,
    }, req, res);
});
// Submit test answers
// export const submitAttempt = tryCatch(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { attemptId } = req.params;
//     const { answers } = req.body;
//     const attempt = await TestAttempt.findById(attemptId)
//       .populate("test")
//       .populate("answers.question");
//     if (!attempt) {
//       return next(new BadRequestError("Attempt not found"));
//     }
//     if (attempt.user.toString() !== (req as any).user._id.toString()) {
//       return next(new Unauthorized("Not your attempt"));
//     }
//     if (attempt.status !== "in-progress") {
//       return next(new BadRequestError("Attempt already submitted"));
//     }
//     // Validate and score answers
//     const scoredAnswers = await Promise.all(
//       answers.map(async (ans: any) => {
//         const question = await Question.findById(ans.questionId);
//         return {
//           question: ans.questionId,
//           selectedOption: ans.selectedOption,
//           isCorrect: question?.correctAnswer === ans.selectedOption,
//         };
//       })
//     );
//     attempt.answers = scoredAnswers;
//     attempt.status = "completed";
//     await attempt.save();
//     appStatus(200, attempt, req, res);
//   }
// );
exports.submitAttempt = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;
    // 1. Validate attempt exists and belongs to user
    const attempt = await attem_model_1.TestAttempt.findOne({
        _id: attemptId,
        user: userId,
        status: "in-progress"
    }).populate({
        path: 'test',
        select: 'passingThreshold'
    });
    if (!attempt) {
        return next(new customError_1.BadRequestError(attempt ? "Attempt already submitted" : "Invalid attempt ID"));
    }
    // 2. Validate answers structure
    if (!Array.isArray(answers)) {
        return next(new customError_1.BadRequestError("Answers must be an array"));
    }
    // 3. Get all questions at once for better performance
    const questionIds = answers.map(ans => ans.questionId);
    const questions = await question_model_1.default.find({
        _id: { $in: questionIds }
    }).lean();
    // 4. Create a question map for quick lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    // 5. Process and validate answers
    const scoredAnswers = answers.map(ans => {
        const question = questionMap.get(ans.questionId);
        if (!question) {
            throw new customError_1.BadRequestError(`Question ${ans.questionId} not found`);
        }
        if (!question.options.includes(ans.selectedOption)) {
            throw new customError_1.BadRequestError(`Invalid option for question ${ans.questionId}`);
        }
        return {
            question: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: question.correctAnswer === ans.selectedOption
        };
    });
    // 6. Calculate score and determine pass/fail
    const correctCount = scoredAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = attempt.answers.length;
    const score = (correctCount / totalQuestions) * 100;
    const isPassed = score >= attempt.test.passingThreshold;
    // 7. Update attempt
    attempt.answers = scoredAnswers;
    attempt.score = score;
    attempt.status = isPassed ? "passed" : "failed";
    attempt.completedAt = new Date();
    console.log({ questionIds, questions, attempt, scoredAnswers, score, isPassed, attemptId, userId });
    await attempt.save();
    // 8. Return comprehensive result
    (0, appStatus_1.default)(200, {
        attemptId: attempt._id,
        status: attempt.status,
        score,
        correctAnswers: correctCount,
        totalQuestions,
        answers: scoredAnswers.map(a => ({
            questionId: a.question,
            selectedOption: a.selectedOption,
            isCorrect: a.isCorrect
        }))
    }, req, res);
});
// Get attempt details
exports.getAttempt = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { attemptId } = req.params;
    const attempt = await attem_model_1.TestAttempt.findById(attemptId)
        .populate("test")
        .populate("user", "-password");
    if (!attempt) {
        return next(new customError_1.BadRequestError("Attempt not found"));
    }
    // Restrict access to owner or admin
    if (attempt.user._id.toString() !==
        req.user._id.toString() &&
        req.user.role !== "admin") {
        return next(new customError_1.Unauthorized("Unauthorized access"));
    }
    (0, appStatus_1.default)(200, attempt, req, res);
});
// check Step 1 failure
async function isStep1Failed(userId) {
    const failedAttempt = await attem_model_1.TestAttempt.findOne({
        user: userId,
        status: "failed",
        test: { $in: await test_model_1.Test.find({ step: 1 }).distinct("_id") },
    });
    return !!failedAttempt;
}

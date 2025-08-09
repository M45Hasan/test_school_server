import { Request, Response, NextFunction } from "express";
import { TestAttempt } from "../../model/attem.model";
import { Test } from "../../model/test.model";
import Question from "../../model/question.model";
import { BadRequestError, Unauthorized } from "../../error/customError";
import { tryCatch } from "../../utils/tryCatch";
import appStatus from "../../utils/appStatus";
import { getQuestionsForAttempt } from "./question.controller";
import { getQuestionsForAttempt_s } from "../services/attempt.service";

// new test attempt
export const startAttempt = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { testId } = req.params;
    const userId = (req as any).user._id;

    // Check active attempt
    const existingAttempt = await TestAttempt.findOne({
      user: userId,
      test: testId,
      status: "in-progress",
    });

    if (existingAttempt) {
      return next(new BadRequestError("You already have an active attempt"));
    }

    // Check retake permission for failed Step 1
    if (await isStep1Failed(userId)) {
      return next(new Unauthorized("Retake not allowed for failed Step 1"));
    }

    const attempt = new TestAttempt({
      user: userId,
      test: testId,
    });

    const mx = await attempt.save();

    // Get questions for the new attempt
    const attemptData = await getQuestionsForAttempt_s(
      (mx as any)._id.toString(),
      userId
    );

    appStatus(
      201,
      {
        user: (req as any).user,
        attempt,
        questions: attemptData.questions,
        timeLeft: attemptData.timeLeft,
      },
      req,
      res
    );
  }
);

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
export const submitAttempt = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = (req as any).user._id;

    // 1. Validate attempt exists and belongs to user
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: "in-progress"
    }).populate({
      path: 'test',
      select: 'passingThreshold'
    });

    if (!attempt) {
      return next(new BadRequestError(
        attempt ? "Attempt already submitted" : "Invalid attempt ID"
      ));
    }

    // 2. Validate answers structure
    if (!Array.isArray(answers)) {
      return next(new BadRequestError("Answers must be an array"));
    }

    // 3. Get all questions at once for better performance
    const questionIds = answers.map(ans => ans.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds }
    }).lean();

    // 4. Create a question map for quick lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    // 5. Process and validate answers
    const scoredAnswers = answers.map(ans => {
      const question = questionMap.get(ans.questionId);
      
      if (!question) {
        throw new BadRequestError(`Question ${ans.questionId} not found`);
      }

      if (!question.options.includes(ans.selectedOption)) {
        throw new BadRequestError(
          `Invalid option for question ${ans.questionId}`
        );
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
    const isPassed = score >= (attempt.test as any).passingThreshold;

    // 7. Update attempt
    attempt.answers = scoredAnswers;
    attempt.score = score;
    attempt.status = isPassed ? "passed" : "failed";
    attempt.completedAt = new Date();
    console.log({questionIds, questions,attempt, scoredAnswers, score, isPassed, attemptId, userId});
    await attempt.save();

    // 8. Return comprehensive result
    appStatus(200, {
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
  }
);

// Get attempt details
export const getAttempt = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate("test")
      .populate("user", "-password");

    if (!attempt) {
      return next(new BadRequestError("Attempt not found"));
    }

    // Restrict access to owner or admin
    if (
      (attempt as any).user._id.toString() !==
        (req as any).user._id.toString() &&
      (req as any).user.role !== "admin"
    ) {
      return next(new Unauthorized("Unauthorized access"));
    }

    appStatus(200, attempt, req, res);
  }
);

// check Step 1 failure
async function isStep1Failed(userId: string): Promise<boolean> {
  const failedAttempt = await TestAttempt.findOne({
    user: userId,
    status: "failed",
    test: { $in: await Test.find({ step: 1 }).distinct("_id") },
  });
  return !!failedAttempt;
}

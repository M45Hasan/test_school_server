import { Request, Response, NextFunction } from "express";
import Question from "../../model/question.model";
import { BadRequestError, Unauthorized } from "../../error/customError";
import { tryCatch } from "../../utils/tryCatch";
import { QuestionZodSchema } from "../../schema/question.zod";
import appStatus from "../../utils/appStatus";
import { TestAttempt } from "../../model/attem.model";
import { TestDocument } from "../../model/test.model";

// Create Question (Admin)
export const createQuestion = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = QuestionZodSchema.parse(req.body);
    if (!validation) {
      return next(new BadRequestError("Invalid question data"));
    }
    // duplicate check
    const existingQuestion = await Question.findOne({
      text: validation.text,
      level: validation.level,
      competency: validation.competency,
    });
    if (existingQuestion) {
      return next(new BadRequestError("Question already exists"));
    }

    const question = new Question(validation);
    await question.save();

    appStatus(201, "Question created successfully", req, res);
  }
);
// Update (Admin)
export const updateQuestion = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const validation = QuestionZodSchema.parse(req.body);

    if (!validation) {
      return next(new BadRequestError("validation failed"));
    }

    const question = await Question.findByIdAndUpdate(id, validation, {
      new: true,
    });

    if (!question) {
      return next(new BadRequestError("Question not found"));
    }

    appStatus(200, question, req, res);
  }
);

// delete Question (Admin)
export const deleteQuestion = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return next(new BadRequestError("Question not found"));
    }

    appStatus(200, "Question deleted successfully", req, res);
  }
);
// Get All
export const getQuestions = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    const result = await (Question as any).paginate({}, options);

    appStatus(200, result, req, res);
  }
);

// Get Questions by Level
export const getQuestionsByLevel = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };
    const { level } = req.params;
    const query = { level };

    const questions = await (Question as any).paginate(query, options);

    appStatus(200, questions, req, res);
  }
);

export const getQuestionsForAttempt = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attemptId } = req.params;
    const userId = (req as any).user._id;

    // 1. Validate attempt exists and belongs to user
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: "in-progress",
    }).populate({
      path: "test",
      select: "levelsCovered totalQuestions duration",
    }).populate({path:"user",select:"-password -__v -createdAt -updatedAt"});

    if (!attempt) {
      return next(
        new BadRequestError(
          attempt ? "Attempt already submitted" : "Invalid attempt ID"
        )
      );
    }

    // 2. Check time remaining
    const elapsedMinutes =
      (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
    const timeLeft = (attempt.test as TestDocument).duration - elapsedMinutes;

    if (timeLeft <= 0) {
      await TestAttempt.findByIdAndUpdate(attemptId, {
        status: "timeout",
        completedAt: new Date(),
      });
      return next(new BadRequestError("Time expired"));
    }

    // 3. Get questions 
    if (attempt.answers.length === 0) {
      const questions = await Question.aggregate([
        {
          $match: {
            level: { $in: (attempt.test as TestDocument).levelsCovered },
          },
        },
        { $sample: { size: (attempt.test as TestDocument).totalQuestions } },
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
      await TestAttempt.findByIdAndUpdate(attemptId, {
        $set: {
          answers: questions.map((q) => ({
            question: q._id,
            selectedOption: "",
          })),
        },
      });

      appStatus(
        200,
        {
          questions,
          timeLeft: Math.floor(timeLeft),
        },
        req,
        res
      );

      return
    }

    // 4. loaded questions
    const questions = await Question.find({
      _id: { $in: attempt.answers.map((a) => a.question) },
    }).select("-correctAnswer");

    appStatus(
      200,
      {
        user:(req as any).user,
        questions,
        timeLeft: Math.floor(timeLeft),
      },
      req,
      res
    );
  }
);

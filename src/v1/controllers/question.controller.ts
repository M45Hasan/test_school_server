import { Request, Response, NextFunction } from "express";
import Question from "../../model/question.model";
import { BadRequestError } from "../../error/customError";
import { tryCatch } from "../../utils/tryCatch";
import { QuestionZodSchema } from "../../schema/question.zod";
import appStatus from "../../utils/appStatus";

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

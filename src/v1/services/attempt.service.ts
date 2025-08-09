// services/attempt.service.ts
import { TestAttempt } from "../../model/attem.model";
import { BadRequestError } from "../../error/customError";
import { TestDocument } from "../../model/test.model";
import Question from "../../model/question.model";

interface IAttemptData {
  questions: any[];
  timeLeft: number;
  attemptId: string;
}

export const getQuestionsForAttempt_s = async (
  attemptId: string,
  userId: string
): Promise<IAttemptData> => {
  // 1. Validate attempt exists and belongs to user
  const attempt = await TestAttempt.findOne({
    _id: attemptId,
    user: userId,
    status: "in-progress",
  }).populate({
    path: "test",
    select: "levelsCovered totalQuestions duration",
  });

  if (!attempt) {
    throw new BadRequestError(
      "Attempt not found or already submitted"
    );
  }

  const test = attempt.test as TestDocument;

  // 2. Check time remaining
  const elapsedMinutes = (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
  const timeLeft = test.duration - elapsedMinutes;

  if (timeLeft <= 0) {
    await TestAttempt.findByIdAndUpdate(attemptId, {
      status: "timeout",
      completedAt: new Date(),
    });
    throw new BadRequestError("Time expired");
  }

  // 3. Get questions
  if (attempt.answers.length === 0) {
    const questions = await Question.aggregate([
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
    await TestAttempt.findByIdAndUpdate(attemptId, {
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
  const questions = await Question.find({
    _id: { $in: attempt.answers.map((a) => a.question) },
  }).select("-correctAnswer");

  return {
    questions,
    timeLeft: Math.floor(timeLeft),
    attemptId,
  };
};
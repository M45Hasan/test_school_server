import { Document, Schema, model, Types } from "mongoose";
import { IUser } from "./user.model";
import { TestDocument } from "./test.model";
import { QuestionDocument } from "./question.model";

export type AttemptStatus = "in-progress" | "passed" | "failed" | "timeout"|"completed";

export interface TestAttemptAnswer {
  question: Types.ObjectId | QuestionDocument;
  selectedOption: string;
  isCorrect?: boolean;
}

export interface TestAttemptDocument extends Document {
  user: Types.ObjectId | IUser;
  test: Types.ObjectId | TestDocument;
  score?: number;
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  answers: TestAttemptAnswer[];
  isRetakeAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestAttemptSchema = new Schema<TestAttemptDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["in-progress", "passed", "failed", "timeout","completed"],
      default: "in-progress",
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      validate: {
        validator: function (this: TestAttemptDocument, v: Date | undefined) {
          return this.status === "in-progress" || v !== undefined;
        },
        message: "completedAt is required for submitted attempts",
      },
    },
    answers: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedOption: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
        },
      },
    ],
    isRetakeAllowed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// hook for auto-completion and timeout
TestAttemptSchema.pre<TestAttemptDocument>("save", function (next) {
  if (this.isModified("status") && this.status !== "in-progress") {
    this.completedAt = this.completedAt || new Date();
  }

  // Timeout logic
  if (this.status === "in-progress" && this.populated("test")) {
    const elapsedMinutes =
      (Date.now() - this.startedAt.getTime()) / (1000 * 60);
    if (elapsedMinutes >= (this.test as TestDocument).duration) {
      this.status = "timeout";
      this.completedAt = new Date();
    }
  }
  next();
});

export const TestAttempt = model<TestAttemptDocument>(
  "TestAttempt",
  TestAttemptSchema
);

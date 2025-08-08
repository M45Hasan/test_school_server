import { Schema, model } from "mongoose";

const TestAttemptSchema = new Schema(
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
      enum: ["in-progress", "passed", "failed", "timeout"],
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
        validator: function (this: any, v: Date) {
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

TestAttemptSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status !== "in-progress") {
    this.completedAt = this.completedAt || new Date();
  }

  // Timeout logic
  if (this.status === "in-progress" && this.test?.duration) {
    const elapsedMinutes =
      (Date.now() - this.startedAt.getTime()) / (1000 * 60);
    if (elapsedMinutes >= this.test.duration) {
      this.status = "timeout";
      this.completedAt = new Date();
    }
  }
  next();
});

const TestAttempt = model("TestAttempt", TestAttemptSchema);
export { TestAttempt };

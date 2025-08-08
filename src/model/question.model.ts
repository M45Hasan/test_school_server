import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const QuestionSchema = new Schema(
  {
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
  },
  { timestamps: true }
);
QuestionSchema.plugin(paginate);
const Question = model("Question", QuestionSchema);
export { Question };

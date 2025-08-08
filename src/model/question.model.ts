import { Document, Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface QuestionDocument extends Document {
  text: string;
  competency: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  options: string[];
  correctAnswer: string;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<QuestionDocument>(
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

const Question = model<QuestionDocument>("Question", QuestionSchema);
export default Question;
import { Document, Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

export type TestStep = 1 | 2 | 3;
export type CompetencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface TestDocument extends Document {
  step: TestStep;
  levelsCovered: CompetencyLevel[];
  totalQuestions: number;
  passingThreshold: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<TestDocument>(
  {
    step: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
      unique: true,
    },
    levelsCovered: {
      type: [String],
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
      validate: {
        validator: function (this: TestDocument, levels: CompetencyLevel[]) {
          const stepToLevels: Record<TestStep, CompetencyLevel[]> = {
            1: ["A1", "A2"],
            2: ["B1", "B2"],
            3: ["C1", "C2"],
          };
          return (
            JSON.stringify([...levels].sort()) ===
            JSON.stringify(stepToLevels[this.step].sort())
          );
        },
        message:
          "Levels must match the step: Step 1 → A1/A2, Step 2 → B1/B2, Step 3 → C1/C2",
      },
    },
    totalQuestions: {
      type: Number,
      default: 44,
      validate: [
        (v: number) => v % 2 === 0,
        "Questions must be even for level balance",
      ],
    },
    passingThreshold: {
      type: Number,
      default: 25,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      required: true,
      min: 2, // min
      max: 180,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
TestSchema.plugin(paginate);
export const Test = model<TestDocument>("Test", TestSchema);

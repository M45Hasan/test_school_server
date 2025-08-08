import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

import bcrypt from "bcrypt";
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin", "supervisor"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    highestCertificationLevel: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: null,
    },
  },
  { timestamps: true }
);

// pre hooks

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (
    update &&
    typeof update === "object" &&
    (update as any).$set &&
    (update as any).$set.highestCertificationLevel
  ) {
    console.log(
      `Certification level updated to: ${
        (update as any).$set.highestCertificationLevel
      }`
    );
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};
UserSchema.plugin(paginate);
const User = model("User", UserSchema);

export { User };

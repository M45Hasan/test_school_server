import mongoose from "mongoose";
export const validMongoId = (id: any) => {
  const mx = mongoose.isValidObjectId(id);

  return mx;
};

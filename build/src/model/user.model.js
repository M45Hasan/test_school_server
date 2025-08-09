"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// pre hooks
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt_1.default.hash(this.password, 10);
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt_1.default.compare(candidatePassword, this.password);
};
UserSchema.plugin(mongoose_paginate_v2_1.default);
const User = (0, mongoose_1.model)("User", UserSchema);
exports.User = User;

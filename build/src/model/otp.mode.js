"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
const mongoose_1 = require("mongoose");
const OTPSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["email", "sms"],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    attemptCount: {
        type: Number,
        default: 0,
    },
    lastAttemptAt: {
        type: Date,
    },
}, { timestamps: true });
// Auto-delete expired
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OTP = (0, mongoose_1.model)("OTP", OTPSchema);
exports.OTP = OTP;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAttempt = void 0;
const mongoose_1 = require("mongoose");
const TestAttemptSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    test: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: ["in-progress", "passed", "failed", "timeout", "completed"],
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
            validator: function (v) {
                return this.status === "in-progress" || v !== undefined;
            },
            message: "completedAt is required for submitted attempts",
        },
    },
    answers: [
        {
            question: {
                type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
// hook for auto-completion and timeout
TestAttemptSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status !== "in-progress") {
        this.completedAt = this.completedAt || new Date();
    }
    // Timeout logic
    if (this.status === "in-progress" && this.populated("test")) {
        const elapsedMinutes = (Date.now() - this.startedAt.getTime()) / (1000 * 60);
        if (elapsedMinutes >= this.test.duration) {
            this.status = "timeout";
            this.completedAt = new Date();
        }
    }
    next();
});
exports.TestAttempt = (0, mongoose_1.model)("TestAttempt", TestAttemptSchema);

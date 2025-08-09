"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = async (error, req, res, next) => {
    try {
        if (error.name !== "InternalServerError" && error.status) {
            // await addLogger.save();
            return res.status(error.status).json({
                error: error.message,
                success: false,
                hint: error.hint || undefined,
                status: error.status,
                type: error.name,
                stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
            });
        }
        if (error.name === "InternalServerError" && error.status) {
            return res.status(500).json({
                success: false,
                error: error.message || "Server Error",
                hint: error.hint || undefined,
                status: error.status,
                type: error.name,
                stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
            });
        }
        if (!error.status && error.name !== "ZodError") {
            return res.status(500).json({
                success: false,
                error: error.message || "Server Error",
                hint: error.hint || undefined,
                status: error.status,
                type: error.name,
                stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
            });
        }
        if (error.name === "ZodError") {
            const mx = JSON.parse(error.message).map((item) => item.message);
            return res.status(400).json({
                success: false,
                error: mx,
                status: 400,
                mx: error.message,
                type: mx.length > 1 ? "Input fields are invalid" : "Input field is invalid",
            });
        }
        if (error.name === "MongoServerError" && error.status === 11000) {
            const match = error.message.match(/dup key: \{ (.+): ["'](.+?)["'] \}/);
            const field = match ? match[1] : "Unknown Field";
            const value = match ? match[2] : "Unknown Value";
            return res.status(400).json({
                success: false,
                error: `Duplicate key error: '${field}' with value '${value}' already exists.`,
                field,
                value,
                type: "DuplicateKeyError",
            });
        }
    }
    catch (err) {
        return next(err);
    }
};
exports.errorHandler = errorHandler;

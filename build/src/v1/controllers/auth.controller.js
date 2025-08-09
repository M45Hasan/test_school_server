"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getAllUsers = exports.updatePassword = exports.getProfile = exports.login = exports.verifyOTP = exports.signup = void 0;
const user_model_1 = require("../../model/user.model");
const auth_service_1 = require("../services/auth.service");
const tryCatch_1 = require("../../utils/tryCatch");
const appStatus_1 = __importDefault(require("../../utils/appStatus"));
const customError_1 = require("../../error/customError");
const user_zod_1 = require("../../schema/user.zod");
const otp_mode_1 = require("../../model/otp.mode");
// Register User
exports.signup = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        return next(new customError_1.BadRequestError("User already exists with this email"));
    }
    // Validate
    const validData = user_zod_1.UserZodSchema.parse(req.body);
    // Create user
    const user = new user_model_1.User(validData);
    await user.save();
    //  send OTP
    const otp = await (0, auth_service_1.generateOTP)(user._id.toString(), "email");
    await (0, auth_service_1.sendOTP)(email, otp.code, "verification");
    (0, appStatus_1.default)(201, "User registered successfully", req, res);
});
// Verify OTP
exports.verifyOTP = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { userId, code } = req.body;
    // Verify OTP
    const otp = await otp_mode_1.OTP.findOne({ user: userId, code });
    if (!otp) {
        return next(new customError_1.NotFoundError("Invalid OTP or user not found"));
    }
    await user_model_1.User.findByIdAndUpdate(userId, { isVerified: true });
    (0, appStatus_1.default)(200, "Email verified successfully", req, res);
});
// Login
exports.login = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        return next(new customError_1.Unauthorized("User not found"));
    }
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new customError_1.Unauthorized("User not found"));
    }
    // Generate tokens
    const { accessToken, refreshToken } = (0, auth_service_1.generateTokens)(user._id.toString());
    (0, appStatus_1.default)(200, {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    }, req, res);
});
exports.getProfile = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const id = req.user?.id;
    const user = await user_model_1.User.findById(id).select("-password");
    (0, appStatus_1.default)(200, user, req, res);
});
exports.updatePassword = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const id = req.user?.id;
    const user = await user_model_1.User.findById(id);
    if (!user) {
        return next(new customError_1.Unauthorized("User not found"));
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new customError_1.Unauthorized("Current password is incorrect"));
    }
    user.password = newPassword;
    await user.save();
    (0, appStatus_1.default)(200, "Password updated successfully", req, res);
});
// Admin-only
exports.getAllUsers = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const role = req.user?.role;
    const { page = "1", limit = "10" } = req.query;
    if (role !== "admin") {
        return next(new customError_1.Forbidden("Only admins can access this resource"));
    }
    const pg = Number(page) || 1;
    const lm = Number(limit) || 10;
    const option = {
        page: pg,
        limit: lm,
        sort: { createdAt: -1 },
        select: "-password",
    };
    const users = await user_model_1.User.paginate({}, option);
    (0, appStatus_1.default)(200, users, req, res);
});
exports.updateUserRole = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const rol = req.user?.role;
    if (rol !== "admin") {
        return next(new customError_1.Forbidden("Only admins can modify roles"));
    }
    // valid
    const validData = user_zod_1.UserUpdateZodSchema.parse(req.body);
    const user = await user_model_1.User.findByIdAndUpdate(validData.userId, { role: validData.role }, { new: true }).select("-password");
    if (!user) {
        return next(new customError_1.BadRequestError("User not found"));
    }
    (0, appStatus_1.default)(200, user, req, res);
});

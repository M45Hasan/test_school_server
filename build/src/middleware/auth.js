"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authenticateJWT = void 0;
const customError_1 = require("../error/customError");
const user_model_1 = require("../model/user.model");
const tryCatch_1 = require("../utils/tryCatch");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT
exports.authenticateJWT = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return next(new customError_1.Unauthorized("No token provided"));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const user = await user_model_1.User.findById(decoded.id).select("-password");
    if (!user) {
        return next(new customError_1.NotFoundError("No token provided"));
    }
    req.user = user;
    next();
});
// RBAC
const checkRole = (roles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        console.log({ role, roles });
        if (!roles.includes(role)) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        next();
    };
};
exports.checkRole = checkRole;

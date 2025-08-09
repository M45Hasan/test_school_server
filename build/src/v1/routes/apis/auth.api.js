"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middleware/auth");
const auth_controller_1 = require("../../controllers/auth.controller");
const _ = express_1.default.Router();
// Public routes
_.post("/signup", auth_controller_1.signup);
_.post("/verify-otp", auth_controller_1.verifyOTP);
_.post("/login", auth_controller_1.login);
// Protected
_.get("/me", auth_1.authenticateJWT, auth_controller_1.getProfile);
_.patch("/update-password", auth_1.authenticateJWT, auth_controller_1.updatePassword);
// Admin
_.get("/admin/users", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), auth_controller_1.getAllUsers);
_.patch("/admin/role", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), auth_controller_1.updateUserRole);
exports.default = _;

import express from "express";
import { authenticateJWT, checkRole } from "../../../middleware/auth";
import {
  getAllUsers,
  getProfile,
  login,
  signup,
  updatePassword,
  updateUserRole,
  verifyOTP,
} from "../../controllers/auth.controller";

const _ = express.Router();

// Public routes
_.post("/signup", signup);
_.post("/verify-otp", verifyOTP);
_.post("/login", login);

// Protected
_.get("/me", authenticateJWT, getProfile);
_.patch("/update-password", authenticateJWT, updatePassword);

// Admin
_.get("/admin/users", authenticateJWT, checkRole(["admin"]), getAllUsers);
_.patch("/admin/role", authenticateJWT, checkRole(["admin"]), updateUserRole);

export default _;

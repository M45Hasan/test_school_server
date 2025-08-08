import { User } from "../../model/user.model";
import { Request, Response } from "express";
import { generateOTP, generateTokens, sendOTP } from "../services/auth.service";
import { tryCatch } from "../../utils/tryCatch";
import appStatus from "../../utils/appStatus";
import { NextFunction } from "connect";
import {
  BadRequestError,
  Forbidden,
  NotFoundError,
  Unauthorized,
} from "../../error/customError";
import { UserUpdateZodSchema, UserZodSchema } from "../../schema/user.zod";
import { OTP } from "../../model/otp.mode";

// Register User
export const signup = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new BadRequestError("User already exists with this email"));
    }
    // Validate
    const validData = UserZodSchema.parse(req.body);
    // Create user
    const user = new User(validData);
    await user.save();

    //  send OTP
    const otp = await generateOTP(user._id.toString(), "email");
    await sendOTP(email, otp.code, "verification");

    appStatus(201, "User registered successfully", req, res);
  }
);

// Verify OTP
export const verifyOTP = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, code } = req.body;

    // Verify OTP
    const otp = await OTP.findOne({ user: userId, code });

    if (!otp) {
      return next(new NotFoundError("Invalid OTP or user not found"));
    }
    await User.findByIdAndUpdate(userId, { isVerified: true });

    appStatus(200, "Email verified successfully", req, res);
  }
);

// Login
export const login = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new Unauthorized("User not found"));
    }

    // Verify password
    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return next(new Unauthorized("User not found"));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    appStatus(
      200,
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      req,
      res
    );
  }
);

export const getProfile = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req as any).user?.id;
    const user = await User.findById(id).select("-password");
    appStatus(200, user, req, res);
  }
);

export const updatePassword = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const id = (req as any).user?.id;
    const user = await User.findById(id);
    if (!user) {
      return next(new Unauthorized("User not found"));
    }

    const isMatch = await (user as any).comparePassword(currentPassword);
    if (!isMatch) {
      return next(new Unauthorized("Current password is incorrect"));
    }

    user.password = newPassword;
    await user.save();

    appStatus(200, "Password updated successfully", req, res);
  }
);

// Admin-only
export const getAllUsers = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;

    const { page = "1", limit = "10" } = req.query;
    if (role !== "admin") {
      return next(new Forbidden("Only admins can access this resource"));
    }
    const pg = Number(page) || 1;
    const lm = Number(limit) || 10;

    const option = {
      page: pg,
      limit: lm,
      sort: { createdAt: -1 },
      select: "-password",
    };
    const users = await (User as any).paginate({}, option);
    appStatus(
      200,
      users,

      req,
      res
    );
  }
);

export const updateUserRole = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const rol = (req as any).user?.role;
    if (rol !== "admin") {
      return next(new Forbidden("Only admins can modify roles"));
    }

    // valid
    const validData = UserUpdateZodSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      validData.userId,

      { role: validData.role },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new BadRequestError("User not found"));
    }

    appStatus(200, user, req, res);
  }
);

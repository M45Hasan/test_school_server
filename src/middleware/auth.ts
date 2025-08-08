import { NotFoundError, Unauthorized } from "../error/customError";
import { User } from "../model/user.model";
import { tryCatch } from "../utils/tryCatch";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT
export const authenticateJWT = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new Unauthorized("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new NotFoundError("No token provided"));
    }

     (req as any).user= user;
    next();
  }
);

// RBAC
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const role = (req as any).user?.role;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};

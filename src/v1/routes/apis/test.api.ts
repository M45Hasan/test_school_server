import express from "express";
import {
  createTest,
  getTestByStep,
  updateTest,
  getAllTests,
  checkEligibility,
} from "../../controllers/test.controller";
import { authenticateJWT, checkRole } from "../../../middleware/auth";

const _ = express.Router();

// Admin
_.post("/", authenticateJWT, checkRole(["admin"]), createTest);
_.patch("/:id", authenticateJWT, checkRole(["admin"]), updateTest);
_.get("/", authenticateJWT, checkRole(["admin"]), getAllTests);

// student
_.get(
  "/:step",
  authenticateJWT,
  checkRole(["admin", "student"]),
  getTestByStep
);
_.get('/', authenticateJWT, checkRole(["student"]), checkEligibility);
export default _;

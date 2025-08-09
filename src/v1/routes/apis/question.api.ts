import express from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  getQuestionsByLevel,
  getQuestionsForAttempt,
  updateQuestion
} from "../../controllers/question.controller";
import { authenticateJWT, checkRole } from "../../../middleware/auth";

const _ = express.Router();

// Admin
_.post("/", authenticateJWT, checkRole(["admin"]), createQuestion);
_.patch("/:id", authenticateJWT, checkRole(["admin"]), updateQuestion);
_.delete("/:id", authenticateJWT, checkRole(["admin"]), deleteQuestion);

// Public
_.get("/", getQuestions);
_.get("/level/:level", getQuestionsByLevel);
_.get(
  '/for-attempt/:attemptId',
  authenticateJWT,
  checkRole(['student']),
  getQuestionsForAttempt
);

export default _;
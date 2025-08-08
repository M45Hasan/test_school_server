import express from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  getQuestionsByLevel,
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

export default _;
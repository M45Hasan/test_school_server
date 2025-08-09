"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_controller_1 = require("../../controllers/question.controller");
const auth_1 = require("../../../middleware/auth");
const _ = express_1.default.Router();
// Admin
_.post("/", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), question_controller_1.createQuestion);
_.patch("/:id", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), question_controller_1.updateQuestion);
_.delete("/:id", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), question_controller_1.deleteQuestion);
// Public
_.get("/", question_controller_1.getQuestions);
_.get("/level/:level", question_controller_1.getQuestionsByLevel);
_.get('/for-attempt/:attemptId', auth_1.authenticateJWT, (0, auth_1.checkRole)(['student']), question_controller_1.getQuestionsForAttempt);
exports.default = _;

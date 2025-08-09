"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attempt_controller_1 = require("../../controllers/attempt.controller");
const auth_1 = require("../../../middleware/auth");
const _ = express_1.default.Router();
// Protected routes
_.post('/:testId/start', auth_1.authenticateJWT, (0, auth_1.checkRole)(["student"]), attempt_controller_1.startAttempt);
_.post('/:attemptId/submit', auth_1.authenticateJWT, (0, auth_1.checkRole)(["student"]), attempt_controller_1.submitAttempt);
_.get('/:attemptId', auth_1.authenticateJWT, (0, auth_1.checkRole)(["student"]), attempt_controller_1.getAttempt);
exports.default = _;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const test_controller_1 = require("../../controllers/test.controller");
const auth_1 = require("../../../middleware/auth");
const _ = express_1.default.Router();
// Admin
_.post("/", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), test_controller_1.createTest);
_.patch("/:id", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), test_controller_1.updateTest);
_.get("/", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin"]), test_controller_1.getAllTests);
// student
_.get("/:step", auth_1.authenticateJWT, (0, auth_1.checkRole)(["admin", "student"]), test_controller_1.getTestByStep);
_.get('/', auth_1.authenticateJWT, (0, auth_1.checkRole)(["student"]), test_controller_1.checkEligibility);
exports.default = _;

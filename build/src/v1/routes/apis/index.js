"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_api_1 = __importDefault(require("./auth.api"));
const question_api_1 = __importDefault(require("./question.api"));
const test_api_1 = __importDefault(require("./test.api"));
const attempt_api_1 = __importDefault(require("./attempt.api"));
const certificate_api_1 = __importDefault(require("./certificate.api"));
const _ = (0, express_1.Router)();
_.use("/auth", auth_api_1.default);
_.use("/questions", question_api_1.default);
_.use("/tests", test_api_1.default);
_.use("/attempts", attempt_api_1.default);
_.use("/certificates", certificate_api_1.default);
exports.default = _;

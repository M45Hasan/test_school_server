"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_controller_1 = require("../../controllers/certificate.controller");
const auth_1 = require("../../../middleware/auth");
const _ = express_1.default.Router();
// Protected
_.post('/:attemptId/generate', auth_1.authenticateJWT, certificate_controller_1.generateCertificate);
_.get('/my-certificates', auth_1.authenticateJWT, certificate_controller_1.getUserCertificates);
// Public
_.get('/verify/:code', certificate_controller_1.verifyCertificate);
exports.default = _;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificate = exports.getUserCertificates = exports.generateCertificate = void 0;
const certificate_model_1 = require("../../model/certificate.model");
const attem_model_1 = require("../../model/attem.model");
const customError_1 = require("../../error/customError");
const tryCatch_1 = require("../../utils/tryCatch");
const appStatus_1 = __importDefault(require("../../utils/appStatus"));
const certificate_service_1 = require("../services/certificate.service");
const user_model_1 = require("../../model/user.model");
const auth_service_1 = require("../services/auth.service");
//  certificate after passing test
exports.generateCertificate = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { attemptId } = req.params;
    const userId = req.user._id;
    // 1. Validate passed attempt
    const attempt = await attem_model_1.TestAttempt.findById(attemptId).populate("test");
    if (!attempt || attempt.user.toString() !== userId.toString()) {
        return next(new customError_1.Unauthorized("Invalid attempt"));
    }
    if (attempt.status !== "passed") {
        return next(new customError_1.BadRequestError("Only passed attempts can generate certificates"));
    }
    // 2. Prevent duplicate certificates
    const existingCert = await certificate_model_1.Certificate.findOne({ testAttempt: attemptId });
    if (existingCert) {
        (0, appStatus_1.default)(200, existingCert, req, res);
        return;
    }
    // 3. Determine certification level based on score
    const level = calculateCertificationLevel(attempt.score || 0, attempt.test.step);
    // 4. Generate PDF (mock service)
    const pdfUrl = await (0, certificate_service_1.generatePDFCertificate)({
        userId,
        userName: req.user.name,
        level,
        score: attempt.score || 0,
    });
    // 5. Create certificate
    const certificate = new certificate_model_1.Certificate({
        user: userId,
        testAttempt: attemptId,
        level,
        pdfUrl,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    // update user's certification level
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        return next(new customError_1.BadRequestError("User not found"));
    }
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentLevelIndex = levels.indexOf(user.highestCertificationLevel || "");
    const newLevelIndex = levels.indexOf(level);
    if (newLevelIndex > currentLevelIndex) {
        await user_model_1.User.findByIdAndUpdate(userId, { highestCertificationLevel: level }, { new: true, runValidators: true });
    }
    await certificate.save();
    // send mail to user with certificate
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Your Certificate is Ready",
        text: `Congratulations ${user.name}, your certificate for the test is ready. You can download it from the following link: ${certificate.pdfUrl}`,
    };
    console.log(mailOptions);
    await auth_service_1.transporter.sendMail(mailOptions);
    (0, appStatus_1.default)(201, certificate, req, res);
});
// Get user certificates
exports.getUserCertificates = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const certificates = await certificate_model_1.Certificate.find({ user: req.user._id })
        .sort("-issuedAt")
        .populate("testAttempt", "score createdAt");
    (0, appStatus_1.default)(200, certificates, req, res);
});
// Verify certificate (public endpoint)
exports.verifyCertificate = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { code } = req.params;
    const certificate = await certificate_model_1.Certificate.findOne({ verificationCode: code })
        .populate("user", "name email")
        .populate("testAttempt", "score");
    if (!certificate) {
        return next(new customError_1.BadRequestError("Invalid verification code"));
    }
    (0, appStatus_1.default)(200, {
        valid: true,
        certificate,
    }, req, res);
});
// Helper function
function calculateCertificationLevel(score, step) {
    if (step === 1)
        return score >= 50 ? "A2" : "A1";
    if (step === 2)
        return score >= 50 ? "B2" : "B1";
    return score >= 50 ? "C2" : "C1";
}

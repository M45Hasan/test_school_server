"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.generateOTP = exports.generateTokens = exports.transporter = void 0;
const otp_mode_1 = require("../../model/otp.mode");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.EMAIL || !process.env.MAIL_PASSWORD) {
    throw new Error("Missing EMAIL or MAIL_PASSWORD in environment");
}
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.MAIL_PASSWORD,
    },
});
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const generateOTP = async (userId, type) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const otp = new otp_mode_1.OTP({
        user: userId,
        code,
        type,
        expiresAt,
    });
    await otp.save();
    return otp;
};
exports.generateOTP = generateOTP;
const sendOTP = async (email, code, purpose) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: purpose === "verification" ? "Email Verification" : "Password Reset",
        text: `Your OTP code is ${code}. It is valid for 15 minutes.`,
    };
    try {
        await exports.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP");
    }
};
exports.sendOTP = sendOTP;

import { OTP } from "../../model/otp.mode";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL || !process.env.MAIL_PASSWORD) {
  throw new Error("Missing EMAIL or MAIL_PASSWORD in environment");
}

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const generateOTP = async (userId: string, type: "email" | "sms") => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const otp = new OTP({
    user: userId,
    code,
    type,
    expiresAt,
  });

  await otp.save();
  return otp;
};

export const sendOTP = async (email: string, code: string, purpose: string) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject:
      purpose === "verification" ? "Email Verification" : "Password Reset",
    text: `Your OTP code is ${code}. It is valid for 15 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP");
  }
};

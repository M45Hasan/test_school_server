import { Request, Response, NextFunction } from "express";
import { Certificate, CertificateLevel } from "../../model/certificate.model";
import { TestAttempt, TestAttemptDocument } from "../../model/attem.model";
import { BadRequestError, Unauthorized } from "../../error/customError";
import { tryCatch } from "../../utils/tryCatch";
import appStatus from "../../utils/appStatus";
import { generatePDFCertificate } from "../services/certificate.service";
import { User } from "../../model/user.model";
import { transporter } from "../services/auth.service";

//  certificate after passing test
export const generateCertificate = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { attemptId } = req.params;
    const userId = (req as any).user._id;

    // 1. Validate passed attempt
    const attempt = await TestAttempt.findById(attemptId).populate("test");

    if (!attempt || attempt.user.toString() !== userId.toString()) {
      return next(new Unauthorized("Invalid attempt"));
    }

    if (attempt.status !== "passed") {
      return next(
        new BadRequestError("Only passed attempts can generate certificates")
      );
    }

    // 2. Prevent duplicate certificates
    const existingCert = await Certificate.findOne({ testAttempt: attemptId });
    if (existingCert) {
      appStatus(200, existingCert, req, res);
      return;
    }

    // 3. Determine certification level based on score
    const level = calculateCertificationLevel(
      attempt.score || 0,
      (attempt.test as any).step
    );

    // 4. Generate PDF (mock service)
    const pdfUrl = await generatePDFCertificate({
      userId,
      userName: (req as any).user.name,
      level,
      score: attempt.score || 0,
    });

    // 5. Create certificate
    const certificate = new Certificate({
      user: userId,
      testAttempt: attemptId,
      level,
      pdfUrl,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    // update user's certification level
    const user = await User.findById(userId);
    if (!user) {
      return next(new BadRequestError("User not found"));
    }
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentLevelIndex = levels.indexOf(
      user.highestCertificationLevel || ""
    );
    const newLevelIndex = levels.indexOf(level);

    if (newLevelIndex > currentLevelIndex) {
      await User.findByIdAndUpdate(
        userId,
        { highestCertificationLevel: level },
        { new: true, runValidators: true }
      );
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
    await transporter.sendMail(mailOptions);

    appStatus(201, certificate, req, res);
  }
);

// Get user certificates
export const getUserCertificates = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const certificates = await Certificate.find({ user: (req as any).user._id })
      .sort("-issuedAt")
      .populate("testAttempt", "score createdAt");

    appStatus(200, certificates, req, res);
  }
);

// Verify certificate (public endpoint)
export const verifyCertificate = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;

    const certificate = await Certificate.findOne({ verificationCode: code })
      .populate("user", "name email")
      .populate("testAttempt", "score");

    if (!certificate) {
      return next(new BadRequestError("Invalid verification code"));
    }

    appStatus(
      200,
      {
        valid: true,
        certificate,
      },
      req,
      res
    );
  }
);

// Helper function
function calculateCertificationLevel(
  score: number,
  step: number
): CertificateLevel {
  if (step === 1) return score >= 50 ? "A2" : "A1";
  if (step === 2) return score >= 50 ? "B2" : "B1";
  return score >= 50 ? "C2" : "C1";
}

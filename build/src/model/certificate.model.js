"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const mongoose_1 = require("mongoose");
const CertificateSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testAttempt: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true
    },
    level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    pdfUrl: {
        type: String
    },
    verificationCode: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });
//verification code
const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};
// code generation
CertificateSchema.pre('save', function (next) {
    if (!this.verificationCode) {
        this.verificationCode = generateUniqueCode();
    }
    next();
});
exports.Certificate = (0, mongoose_1.model)('Certificate', CertificateSchema);

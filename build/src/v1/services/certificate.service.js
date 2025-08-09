"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDFCertificate = void 0;
const generatePDFCertificate = async (data) => {
    return `https://your-storage.com/certs/${data.userId}-${Date.now()}.pdf`;
};
exports.generatePDFCertificate = generatePDFCertificate;

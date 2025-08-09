import express from 'express';
import {
  generateCertificate,
  getUserCertificates,
  verifyCertificate
} from '../../controllers/certificate.controller';
import { authenticateJWT } from '../../../middleware/auth'

const _ = express.Router();

// Protected
_.post('/:attemptId/generate', authenticateJWT, generateCertificate);
_.get('/my-certificates', authenticateJWT, getUserCertificates);

// Public
_.get('/verify/:code', verifyCertificate);

export default _;
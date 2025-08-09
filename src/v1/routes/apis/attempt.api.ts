import express from 'express';
import {
  startAttempt,
  submitAttempt,
  getAttempt
} from '../../controllers/attempt.controller';
import { authenticateJWT, checkRole } from '../../../middleware/auth';

const _ = express.Router();

// Protected routes
_.post('/:testId/start', authenticateJWT,checkRole(["student"]), startAttempt);
_.post('/:attemptId/submit', authenticateJWT,checkRole(["student"]), submitAttempt);
_.get('/:attemptId', authenticateJWT,checkRole(["student"]), getAttempt);

export default _;
import express from 'express';
import {
  getModulesByPath,
  getModuleById,
  updateProgress,
  submitQuiz,
  getProgressSummary,
  generateCertificate,
  getCertificates
} from '../controllers/training.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All training routes require authentication
router.use(authenticateToken);

// Get modules by training path (operator or technician)
router.get('/modules/:path', getModulesByPath);

// Get single module with content and quiz
router.get('/module/:id', getModuleById);

// Update module progress
router.post('/progress/:moduleId', updateProgress);

// Submit quiz
router.post('/quiz/:moduleId', submitQuiz);

// Get progress summary for a path
router.get('/progress/:path', getProgressSummary);

// Generate certificate
router.post('/certificate/:path', generateCertificate);

// Get user certificates
router.get('/certificates', getCertificates);

export default router;

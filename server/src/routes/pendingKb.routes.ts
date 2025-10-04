import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  submitSolution,
  getPendingEntries,
  getPendingEntryById,
  approvePendingEntry,
  rejectPendingEntry,
  deletePendingEntry
} from '../controllers/pendingKb.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/pending-kb - Submit solution for review
router.post('/', submitSolution);

// GET /api/pending-kb - Get all pending entries (admin only)
router.get('/', getPendingEntries);

// GET /api/pending-kb/:id - Get single pending entry
router.get('/:id', getPendingEntryById);

// POST /api/pending-kb/:id/approve - Approve entry (admin only)
router.post('/:id/approve', approvePendingEntry);

// POST /api/pending-kb/:id/reject - Reject entry (admin only)
router.post('/:id/reject', rejectPendingEntry);

// DELETE /api/pending-kb/:id - Delete entry (admin only)
router.delete('/:id', deletePendingEntry);

export default router;

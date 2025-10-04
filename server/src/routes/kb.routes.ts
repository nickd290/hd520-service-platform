import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getAllKnowledge,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  searchKnowledge,
  uploadDocument
} from '../controllers/kb.controller';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, and Text files are allowed.'));
    }
  }
});

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/kb - Get all knowledge base entries
router.get('/', getAllKnowledge);

// GET /api/kb/search?q=query - Search knowledge base
router.get('/search', searchKnowledge);

// GET /api/kb/:id - Get single knowledge entry
router.get('/:id', getKnowledgeById);

// POST /api/kb/upload - Upload document (technician/admin only)
router.post('/upload', upload.single('document'), uploadDocument);

// POST /api/kb - Create new knowledge entry (technician/admin only)
router.post('/', createKnowledge);

// PUT /api/kb/:id - Update knowledge entry (technician/admin only)
router.put('/:id', updateKnowledge);

// DELETE /api/kb/:id - Delete knowledge entry (admin only)
router.delete('/:id', deleteKnowledge);

export default router;

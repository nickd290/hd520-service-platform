import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createConversation,
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
  uploadPhoto
} from '../controllers/chat.controller';

// Configure multer for photo uploads
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and HEIC images are allowed.'));
    }
  }
});

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/chat/conversation - Create new conversation
router.post('/conversation', createConversation);

// POST /api/chat/message - Send message with streaming response
router.post('/message', sendMessage);

// POST /api/chat/photo - Upload photo to conversation
router.post('/photo', photoUpload.single('photo'), uploadPhoto);

// GET /api/chat/conversations - Get user's conversations
router.get('/conversations', getConversations);

// GET /api/chat/conversation/:id - Get conversation messages
router.get('/conversation/:id', getConversationMessages);

// DELETE /api/chat/conversation/:id - Delete conversation
router.delete('/conversation/:id', deleteConversation);

export default router;

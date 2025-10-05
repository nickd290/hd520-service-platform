import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST

import express from 'express';
import cors from 'cors';
import path from 'path';
import './config/database'; // Initialize database
import { seedTrainingData } from './config/seed';
import { seedKnowledgeBase } from './config/seedKnowledgeBase';
import { seedTestData } from './config/seedTestData';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import machineRoutes from './routes/machine.routes';
import ticketRoutes from './routes/ticket.routes';
import kbRoutes from './routes/kb.routes';
import trainingRoutes from './routes/training.routes';
import chatRoutes from './routes/chat.routes';
import metricsRoutes from './routes/metrics.routes';
import pendingKbRoutes from './routes/pendingKb.routes';
import { errorHandler } from './middleware/errorHandler';

// Seed data on startup
seedTrainingData();
seedKnowledgeBase();
seedTestData();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/pending-kb', pendingKbRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

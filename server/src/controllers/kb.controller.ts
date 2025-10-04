import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// Lazy load pdf-parse to avoid DOMMatrix issues on Railway
let pdfParse: any = null;
const getPdfParse = () => {
  if (!pdfParse) {
    try {
      pdfParse = require('pdf-parse');
    } catch (error) {
      console.warn('pdf-parse not available, PDF uploads will be disabled');
      return null;
    }
  }
  return pdfParse;
};

// Get all knowledge base entries
export const getAllKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const result = query(
      'SELECT * FROM knowledge_base ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
};

// Get single knowledge entry
export const getKnowledgeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = query('SELECT * FROM knowledge_base WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get knowledge entry error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge entry' });
  }
};

// Create new knowledge entry
export const createKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    // Only technicians and admins can add knowledge
    if (userRole !== 'technician' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only technicians and admins can add knowledge' });
    }

    const { title, content, category, error_codes, tags } = req.body;

    const id = randomUUID();

    query(
      `INSERT INTO knowledge_base (id, title, content, category, error_codes, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        content,
        category || '',
        JSON.stringify(error_codes || []),
        JSON.stringify(tags || [])
      ]
    );

    const result = query('SELECT * FROM knowledge_base WHERE id = ?', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create knowledge error:', error);
    res.status(500).json({ error: 'Failed to create knowledge entry' });
  }
};

// Update knowledge entry
export const updateKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'technician' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only technicians and admins can update knowledge' });
    }

    const { id } = req.params;
    const { title, content, category, error_codes, tags } = req.body;

    query(
      `UPDATE knowledge_base
       SET title = ?, content = ?, category = ?, error_codes = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        content,
        category || '',
        JSON.stringify(error_codes || []),
        JSON.stringify(tags || []),
        id
      ]
    );

    const result = query('SELECT * FROM knowledge_base WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update knowledge error:', error);
    res.status(500).json({ error: 'Failed to update knowledge entry' });
  }
};

// Delete knowledge entry
export const deleteKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete knowledge' });
    }

    const { id } = req.params;

    const result = query('DELETE FROM knowledge_base WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }

    res.json({ message: 'Knowledge entry deleted successfully' });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge entry' });
  }
};

// Search knowledge base
export const searchKnowledge = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q}%`;

    const result = query(
      `SELECT * FROM knowledge_base
       WHERE title LIKE ? OR content LIKE ? OR category LIKE ? OR tags LIKE ?
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search knowledge error:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
};

// Upload and parse document
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'technician' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only technicians and admins can upload documents' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    let content = '';
    let title = path.basename(file.originalname, path.extname(file.originalname));

    // Parse based on file type
    if (file.mimetype === 'application/pdf') {
      const pdf = getPdfParse();
      if (!pdf) {
        return res.status(500).json({ error: 'PDF parsing is not available on this server' });
      }
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               file.mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ path: file.path });
      content = result.value;
    } else if (file.mimetype === 'text/plain') {
      content = fs.readFileSync(file.path, 'utf-8');
    } else {
      // Clean up file
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, Word, or Text files.' });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    // Extract category from filename or content
    let category = 'general';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ink') || lowerTitle.includes('cartridge')) category = 'ink-system';
    else if (lowerTitle.includes('head') || lowerTitle.includes('printhead')) category = 'printhead';
    else if (lowerTitle.includes('mechanical') || lowerTitle.includes('motor')) category = 'mechanical';
    else if (lowerTitle.includes('error') || lowerTitle.includes('troubleshoot')) category = 'troubleshooting';
    else if (lowerTitle.includes('maintenance') || lowerTitle.includes('cleaning')) category = 'maintenance';
    else if (lowerTitle.includes('safety')) category = 'safety';

    // Extract error codes from content (E-XXX pattern)
    const errorCodeMatches = content.match(/E-\d{3}/g);
    const errorCodes = errorCodeMatches ? [...new Set(errorCodeMatches)] : [];

    // Extract tags from content
    const tags: string[] = [];
    if (content.toLowerCase().includes('bulk ink')) tags.push('bulk-ink-system');
    if (content.toLowerCase().includes('nozzle')) tags.push('nozzle');
    if (content.toLowerCase().includes('alignment')) tags.push('alignment');
    if (content.toLowerCase().includes('calibration')) tags.push('calibration');
    if (content.toLowerCase().includes('cleaning')) tags.push('cleaning');

    const id = randomUUID();

    query(
      `INSERT INTO knowledge_base (id, title, content, category, error_codes, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        content,
        category,
        JSON.stringify(errorCodes),
        JSON.stringify(tags)
      ]
    );

    const result = query('SELECT * FROM knowledge_base WHERE id = ?', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload document error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload and parse document' });
  }
};

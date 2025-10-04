import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { randomUUID } from 'crypto';

// Submit solution to knowledge base
export const submitSolution = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const {
      conversation_id,
      title,
      issue_description,
      solution_steps,
      category,
      error_codes,
      tags,
      photos,
      parts_used,
      time_to_resolve,
      machine_serial
    } = req.body;

    const id = randomUUID();

    // Combine issue and solution into content
    const content = `**Issue:**
${issue_description}

**Solution:**
${solution_steps}

${parts_used ? `**Parts Used:**
${parts_used}` : ''}

${time_to_resolve ? `**Time to Resolve:** ${time_to_resolve} minutes` : ''}`;

    query(
      `INSERT INTO pending_kb_entries (
        id, conversation_id, title, content, category, error_codes, tags,
        photos, issue_description, solution_steps, parts_used, time_to_resolve,
        machine_serial, submitted_by, user_role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        conversation_id,
        title,
        content,
        category || 'general',
        JSON.stringify(error_codes || []),
        JSON.stringify(tags || []),
        JSON.stringify(photos || []),
        issue_description,
        solution_steps,
        parts_used || '',
        time_to_resolve || null,
        machine_serial || '',
        userId,
        userRole
      ]
    );

    const result = query('SELECT * FROM pending_kb_entries WHERE id = ?', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
};

// Get all pending KB entries (admin only)
export const getPendingEntries = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view pending entries' });
    }

    const { status } = req.query;

    let result;
    if (status) {
      result = query(
        'SELECT * FROM pending_kb_entries WHERE status = ? ORDER BY created_at DESC',
        [status]
      );
    } else {
      result = query(
        'SELECT * FROM pending_kb_entries ORDER BY created_at DESC'
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get pending entries error:', error);
    res.status(500).json({ error: 'Failed to fetch pending entries' });
  }
};

// Get single pending entry
export const getPendingEntryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = query('SELECT * FROM pending_kb_entries WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get pending entry error:', error);
    res.status(500).json({ error: 'Failed to fetch pending entry' });
  }
};

// Approve pending entry (moves to knowledge_base)
export const approvePendingEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve entries' });
    }

    const { id } = req.params;
    const { review_notes, edited_title, edited_content, edited_category, edited_tags } = req.body;

    // Get pending entry
    const pendingResult = query('SELECT * FROM pending_kb_entries WHERE id = ?', [id]);

    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending entry not found' });
    }

    const pending = pendingResult.rows[0];

    // Create knowledge base entry
    const kbId = randomUUID();
    query(
      `INSERT INTO knowledge_base (
        id, title, content, category, error_codes, tags, source, confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, 'manual', 0.8)`,
      [
        kbId,
        edited_title || pending.title,
        edited_content || pending.content,
        edited_category || pending.category,
        pending.error_codes,
        edited_tags || pending.tags
      ]
    );

    // Update pending entry status
    query(
      `UPDATE pending_kb_entries
       SET status = 'approved', reviewed_by = ?, review_notes = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId, review_notes || '', id]
    );

    res.json({ message: 'Entry approved and added to knowledge base', kb_id: kbId });
  } catch (error) {
    console.error('Approve entry error:', error);
    res.status(500).json({ error: 'Failed to approve entry' });
  }
};

// Reject pending entry
export const rejectPendingEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reject entries' });
    }

    const { id } = req.params;
    const { review_notes } = req.body;

    const result = query(
      `UPDATE pending_kb_entries
       SET status = 'rejected', reviewed_by = ?, review_notes = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId, review_notes || '', id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pending entry not found' });
    }

    res.json({ message: 'Entry rejected' });
  } catch (error) {
    console.error('Reject entry error:', error);
    res.status(500).json({ error: 'Failed to reject entry' });
  }
};

// Delete pending entry
export const deletePendingEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete entries' });
    }

    const { id } = req.params;

    const result = query('DELETE FROM pending_kb_entries WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pending entry not found' });
    }

    res.json({ message: 'Pending entry deleted' });
  } catch (error) {
    console.error('Delete pending entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

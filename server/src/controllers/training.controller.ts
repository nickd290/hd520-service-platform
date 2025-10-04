import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { randomUUID } from 'crypto';

// Get all modules for a training path
export const getModulesByPath = async (req: AuthRequest, res: Response) => {
  try {
    const { path } = req.params; // 'operator' or 'technician'
    const userId = req.user?.id;

    const modulesQuery = query(
      `SELECT
        tm.*,
        COALESCE(tp.status, 'not_started') as user_status,
        COALESCE(tp.progress_percentage, 0) as progress_percentage,
        tp.quiz_score,
        tp.quiz_passed
       FROM training_modules tm
       LEFT JOIN training_progress tp ON tm.id = tp.module_id AND tp.user_id = ?
       WHERE tm.training_path = ? AND tm.is_published = 1
       ORDER BY tm.order_index ASC`,
      [userId, path]
    );

    res.json(modulesQuery.rows);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

// Get single module with content and quiz
export const getModuleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get module details
    const moduleQuery = query<any>(
      `SELECT
        tm.*,
        COALESCE(tp.status, 'not_started') as user_status,
        COALESCE(tp.progress_percentage, 0) as progress_percentage,
        tp.last_section_viewed,
        tp.quiz_score,
        tp.quiz_passed
       FROM training_modules tm
       LEFT JOIN training_progress tp ON tm.id = tp.module_id AND tp.user_id = ?
       WHERE tm.id = ?`,
      [userId, id]
    );

    if (moduleQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Get content sections
    const contentQuery = query<any>(
      'SELECT * FROM training_content WHERE module_id = ? ORDER BY order_index ASC',
      [id]
    );

    // Get quiz questions (parse JSON options)
    const quizQuery = query<any>(
      'SELECT id, question_text, question_type, options, order_index FROM quiz_questions WHERE module_id = ? ORDER BY order_index ASC',
      [id]
    );

    // Parse JSON options in quiz questions
    const quizQuestions = quizQuery.rows.map((q: any) => {
      const parsed: any = { ...q };
      if (typeof q.options === 'string') {
        parsed.options = JSON.parse(q.options);
      }
      return parsed;
    });

    const moduleData: any = moduleQuery.rows[0];
    const module: any = {
      ...moduleData,
      content: contentQuery.rows,
      quiz: quizQuestions
    };

    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
};

// Update module progress
export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;
    const { status, progress_percentage, last_section_viewed } = req.body;

    // Check if progress exists
    const existing = query(
      'SELECT id FROM training_progress WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    if (existing.rows.length > 0) {
      // Update
      query(
        `UPDATE training_progress
         SET status = ?, progress_percentage = ?, last_section_viewed = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND module_id = ?`,
        [status, progress_percentage, last_section_viewed, userId, moduleId]
      );
    } else {
      // Insert
      query(
        `INSERT INTO training_progress (id, user_id, module_id, status, progress_percentage, last_section_viewed, started_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [randomUUID(), userId, moduleId, status, progress_percentage, last_section_viewed]
      );
    }

    const result = query(
      'SELECT * FROM training_progress WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

// Submit quiz attempt
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;
    const { answers } = req.body;

    // Get quiz questions with correct answers
    const questionsQuery = query(
      'SELECT id, options FROM quiz_questions WHERE module_id = ? ORDER BY order_index ASC',
      [moduleId]
    );

    const questions = questionsQuery.rows;
    let correctCount = 0;

    // Calculate score
    questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
      const correctOption = options.find((opt: any) => opt.is_correct);

      if (userAnswer === correctOption?.text) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% pass threshold

    // Save quiz attempt
    query(
      `INSERT INTO quiz_attempts (id, user_id, module_id, score, total_questions, percentage, passed, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), userId, moduleId, correctCount, totalQuestions, percentage, passed ? 1 : 0, JSON.stringify(answers)]
    );

    // Update training progress
    const existing = query(
      'SELECT id FROM training_progress WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    const newStatus = passed ? 'completed' : 'in_progress';
    const completedAt = passed ? new Date().toISOString() : null;

    if (existing.rows.length > 0) {
      query(
        `UPDATE training_progress
         SET status = ?, quiz_score = ?, quiz_passed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND module_id = ?`,
        [newStatus, percentage, passed ? 1 : 0, completedAt, userId, moduleId]
      );
    } else {
      query(
        `INSERT INTO training_progress (id, user_id, module_id, status, quiz_score, quiz_passed, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), userId, moduleId, newStatus, percentage, passed ? 1 : 0, completedAt]
      );
    }

    res.json({
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Please review the material and try again.'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get user progress summary
export const getProgressSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { path } = req.params;

    const progressQuery = query(
      `SELECT
        tm.id,
        tm.title,
        tm.training_path,
        tm.duration_minutes,
        COALESCE(tp.status, 'not_started') as status,
        COALESCE(tp.progress_percentage, 0) as progress_percentage,
        tp.quiz_score,
        tp.quiz_passed,
        tp.completed_at
       FROM training_modules tm
       LEFT JOIN training_progress tp ON tm.id = tp.module_id AND tp.user_id = ?
       WHERE tm.training_path = ? AND tm.is_published = 1
       ORDER BY tm.order_index ASC`,
      [userId, path]
    );

    const modules = progressQuery.rows;
    const totalModules = modules.length;
    const completedModules = modules.filter((m: any) => m.status === 'completed').length;
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    res.json({
      path,
      totalModules,
      completedModules,
      overallProgress,
      modules
    });
  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({ error: 'Failed to fetch progress summary' });
  }
};

// Generate certificate
export const generateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = req.user;
    const { path } = req.params;

    // Check if all modules are completed
    const progressQuery = query<any>(
      `SELECT
        (SELECT COUNT(*) FROM training_modules WHERE training_path = ? AND is_published = 1) as total,
        (SELECT COUNT(*) FROM training_progress tp
         JOIN training_modules tm ON tp.module_id = tm.id
         WHERE tp.user_id = ? AND tm.training_path = ? AND tp.status = 'completed' AND tp.quiz_passed = 1) as completed`,
      [path, userId, path]
    );

    const progressData: any = progressQuery.rows[0];
    const { total, completed } = progressData as { total: number; completed: number };

    if (total !== completed) {
      return res.status(400).json({
        error: 'All modules must be completed with passing scores to earn a certificate',
        progress: { total, completed }
      });
    }

    // Check if certificate already exists
    const existingCert = query<any>(
      'SELECT * FROM certificates WHERE user_id = ? AND training_path = ? AND is_valid = 1',
      [userId, path]
    );

    if (existingCert.rows.length > 0) {
      return res.json(existingCert.rows[0]);
    }

    // Generate certificate number
    const certNumber = `HD520-${path.toUpperCase()}-${Date.now()}-${userId?.substring(0, 8)}`;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2 year validity

    // Create certificate
    query(
      `INSERT INTO certificates (id, user_id, training_path, certificate_number, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), userId, path, certNumber, expiresAt.toISOString()]
    );

    const certResult = query<any>(
      'SELECT * FROM certificates WHERE certificate_number = ?',
      [certNumber]
    );

    const certData = certResult.rows[0];
    res.json({
      ...certData,
      user_name: `${user?.first_name} ${user?.last_name}`
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

// Get user certificates
export const getCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = query(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

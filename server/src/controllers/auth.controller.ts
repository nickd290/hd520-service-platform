import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { randomUUID } from 'crypto';
import { User, AuthRequest } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role = 'customer' } = req.body;

    // Check if user exists
    const userExists = query<User>('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate UUID
    const id = randomUUID();

    // Insert user
    query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, password_hash, first_name, last_name, role]
    );

    // Get created user
    const result = query<User>('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [id]);
    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role } as any,
      process.env.JWT_SECRET!
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

interface UserWithPassword extends User {
  password_hash: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = query<UserWithPassword>('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userWithPassword = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: userWithPassword.id, email: userWithPassword.email, role: userWithPassword.role, credential_code: userWithPassword.credential_code } as any,
      process.env.JWT_SECRET!
    );

    // Remove password_hash from response
    const { password_hash, ...user } = userWithPassword;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const result = query<User>(
      'SELECT id, email, first_name, last_name, role, credential_code, is_active FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, User } from '../types';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

export const verifyCredential = (requiredLevel?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const { credential_code } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Technicians and admins with valid credentials can proceed
    if (user.role === 'admin' || (user.role === 'technician' && user.credential_code === credential_code)) {
      next();
    } else {
      return res.status(403).json({ error: 'Valid technician credentials required for this operation' });
    }
  };
};

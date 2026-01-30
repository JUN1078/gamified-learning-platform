import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Get user from database
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, username FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

// Alias for compatibility
export const authenticateToken = protect;

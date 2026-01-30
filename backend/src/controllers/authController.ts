import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, username, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    const userId = result.insertId;

    // Create character for user
    await pool.query(
      'INSERT INTO characters (user_id) VALUES (?)',
      [userId]
    );

    // Get created user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(userId.toString());

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user
    console.log('🔍 Looking up user in database...');
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, username, password, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    console.log('👤 Found users:', users.length);
    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const user = users[0];
    console.log('✅ User found:', user.email, 'ID:', user.id);

    // Check password
    console.log('🔒 Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    console.log('✅ Login successful!');

    // Generate token
    const token = generateToken(user.id.toString());

    res.json({
      success: true,
      data: {
        user: {
          _id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        _id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

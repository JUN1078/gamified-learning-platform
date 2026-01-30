import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// @desc    Check if test user exists and verify password
// @route   GET /api/debug/test-user
// @access  Public (REMOVE AFTER DEBUGGING)
router.get('/test-user', async (_req, res) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, username, password FROM users WHERE email = ?',
      ['test@learnhub.com']
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: 'Test user does NOT exist in database',
        userExists: false
      });
    }

    const user = users[0];

    // Test password hash
    const isPasswordValid = await bcrypt.compare('test123', user.password);

    res.json({
      success: true,
      userExists: true,
      userId: user.id,
      email: user.email,
      username: user.username,
      passwordHashLength: user.password.length,
      passwordValid: isPasswordValid,
      message: isPasswordValid
        ? '✅ Test user exists and password is correct!'
        : '❌ Test user exists but password hash is INVALID'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = express.Router();
const execAsync = promisify(exec);

// @desc    Initialize database (ONE-TIME USE ONLY)
// @route   GET /api/setup/init-database
// @access  Public (should be removed after use)
router.get('/init-database', async (_req, res) => {
  try {
    console.log('🔧 Starting database initialization...');

    // Run initialization scripts
    await execAsync('npm run db:init');
    console.log('✅ Database tables created');

    await execAsync('npm run db:add-culture-quest');
    console.log('✅ Culture Quest data added');

    await execAsync('npm run db:add-levio');
    console.log('✅ Levio features added');

    await execAsync('npm run db:create-test-user');
    console.log('✅ Test user created');

    res.json({
      success: true,
      message: 'Database initialized successfully! Remove this endpoint now.',
      data: {
        tables_created: 13,
        test_user: {
          email: 'test@learnhub.com',
          password: 'test123'
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    });
  }
});

// @desc    Add ARISE Peer Review System (ONE-TIME USE ONLY)
// @route   GET /api/setup/add-peer-review
// @access  Public (should be removed after use)
router.get('/add-peer-review', async (_req, res) => {
  try {
    console.log('🔧 Starting ARISE Peer Review System migration...');

    // Run peer review migration script
    await execAsync('npx tsx src/scripts/addPeerReviewSystem.ts');
    console.log('✅ Peer Review System tables and data added');

    res.json({
      success: true,
      message: 'ARISE Peer Review System added successfully!',
      data: {
        tables_created: 9,
        dimensions: 5,
        statements: 25,
        badges: 11,
      }
    });
  } catch (error: any) {
    console.error('❌ Peer Review System migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    });
  }
});

export default router;

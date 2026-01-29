import express from 'express';
import {
  getRewards,
  getUserRewards,
  redeemReward
} from '../controllers/rewardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All reward routes require authentication
router.use(authenticateToken);

// Get all available rewards
router.get('/', getRewards);

// Get user's redeemed rewards
router.get('/my-rewards', getUserRewards);

// Redeem a reward
router.post('/redeem', redeemReward);

export default router;

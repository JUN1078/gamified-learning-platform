import express from 'express';
import {
  getUserMissions,
  claimMissionReward
} from '../controllers/missionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All mission routes require authentication
router.use(authenticateToken);

// Get user's missions
router.get('/', getUserMissions);

// Claim mission reward
router.post('/claim', claimMissionReward);

export default router;

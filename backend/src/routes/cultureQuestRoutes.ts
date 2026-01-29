import express from 'express';
import {
  getActiveScenarios,
  submitResponse,
  getUserScores,
  getUserRadarData,
  getOrganizationAnalytics,
  getDimensionTrend,
} from '../controllers/cultureQuestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Get scenarios for user (based on context/trigger)
router.get('/scenarios', getActiveScenarios);

// Submit user response
router.post('/response', submitResponse);

// Get user's culture scores
router.get('/scores', getUserScores);

// Get radar chart data
router.get('/radar', getUserRadarData);

// Get organization-level analytics (admin)
router.get('/analytics/organization', getOrganizationAnalytics);

// Get dimension trend over time
router.get('/analytics/trend/:dimensionId', getDimensionTrend);

export default router;

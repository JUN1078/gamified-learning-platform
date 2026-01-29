import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Mock badge data
const mockBadges = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first learning module',
    story: 'Every journey begins with a single step',
    tier: 'bronze' as const,
    iconUrl: '',
    category: 'Getting Started',
    unlockCriteria: {
      type: 'custom' as const,
      requirement: 'Complete first module',
      count: 1,
    },
  },
  {
    id: '2',
    name: 'Mountain Climber',
    description: 'Complete your first mountain',
    story: 'You have conquered your first peak',
    tier: 'silver' as const,
    iconUrl: '',
    category: 'Expedition',
    unlockCriteria: {
      type: 'checkpoint' as const,
      requirement: 'Complete all checkpoints',
      count: 1,
    },
  },
  {
    id: '3',
    name: 'ARISE Legend',
    description: 'Complete all 5 mountains',
    story: 'You are a true master of ARISE values',
    tier: 'gold' as const,
    iconUrl: '',
    category: 'Mastery',
    unlockCriteria: {
      type: 'checkpoint' as const,
      requirement: 'Complete all mountains',
      count: 5,
    },
  },
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockBadges,
  });
});

router.get('/user', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

router.get('/achievements', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

router.get('/achievements/timeline', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

export default router;

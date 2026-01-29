import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Mock card data
const mockCards = [
  {
    id: '1',
    name: 'Leadership Master',
    description: 'Demonstrates exceptional leadership abilities',
    rarity: 'legendary' as const,
    category: 'master' as const,
    imageUrl: '',
    relatedAttribute: 'leadership',
    unlockCriteria: 'Reach leadership level 10',
  },
  {
    id: '2',
    name: 'Creative Thinker',
    description: 'Shows outstanding creativity',
    rarity: 'epic' as const,
    category: 'attribute' as const,
    imageUrl: '',
    relatedAttribute: 'creativity',
    unlockCriteria: 'Complete 5 creative challenges',
  },
  {
    id: '3',
    name: 'Team Player',
    description: 'Excellent teamwork skills',
    rarity: 'rare' as const,
    category: 'attribute' as const,
    imageUrl: '',
    relatedAttribute: 'teamwork',
    unlockCriteria: 'Collaborate on 3 projects',
  },
  {
    id: '4',
    name: 'Problem Solver',
    description: 'Solves problems effectively',
    rarity: 'common' as const,
    category: 'attribute' as const,
    imageUrl: '',
    relatedAttribute: 'problemSolving',
    unlockCriteria: 'Complete first challenge',
  },
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockCards,
  });
});

router.get('/collection', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

router.get('/available', (req, res) => {
  res.json({
    success: true,
    data: mockCards,
  });
});

router.post('/assign', (req, res) => {
  res.json({
    success: true,
    data: {},
  });
});

export default router;

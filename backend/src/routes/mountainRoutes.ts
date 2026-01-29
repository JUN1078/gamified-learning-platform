import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Temporary stub routes - will return mock data
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'aggressive',
        name: 'Aggressive',
        description: 'The Driving Force',
        color: '#FF6B6B',
        attributes: ['leadership', 'problemSolving'],
        checkpoints: [
          { id: '1', mountainId: 'aggressive', name: 'Base Camp', description: 'Start your journey', order: 1, requiredAttributes: [], rewards: [], isCompleted: false },
          { id: '2', mountainId: 'aggressive', name: 'Mid Camp', description: 'Halfway there', order: 2, requiredAttributes: [], rewards: [], isCompleted: false },
        ],
        isUnlocked: true,
        isCompleted: false,
        progress: 0,
      },
      {
        id: 'respect',
        name: 'Respect',
        description: 'The Heart of the Team',
        color: '#CD7F32',
        attributes: ['empathy', 'communication'],
        checkpoints: [],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
      },
      {
        id: 'innovative',
        name: 'Innovative',
        description: 'The Visionary',
        color: '#B8C5D6',
        attributes: ['innovation', 'creativity'],
        checkpoints: [],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
      },
      {
        id: 'swift',
        name: 'Swift',
        description: 'The Quick Adaptor',
        color: '#2196F3',
        attributes: ['adaptability', 'criticalThinking'],
        checkpoints: [],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
      },
      {
        id: 'empowered',
        name: 'Empowered',
        description: 'The Independent Spirit',
        color: '#4CAF50',
        attributes: ['resilience', 'strategicThinking'],
        checkpoints: [],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
      },
    ],
  });
});

router.get('/progress', (req, res) => {
  res.json({
    success: true,
    data: {},
  });
});

router.post('/checkpoint', (req, res) => {
  res.json({
    success: true,
    data: { checkpoint: {}, rewards: [] },
  });
});

export default router;

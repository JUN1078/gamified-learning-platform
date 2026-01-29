import express from 'express';
import {
  getLessons,
  getLessonById,
  startLesson,
  updateProgress,
  submitAnswers
} from '../controllers/lessonController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All lesson routes require authentication
router.use(authenticateToken);

// Get all lessons
router.get('/', getLessons);

// Get specific lesson with content
router.get('/:id', getLessonById);

// Start a lesson
router.post('/start', startLesson);

// Update progress (for read lessons)
router.post('/progress', updateProgress);

// Submit answers (for exercise/exam lessons)
router.post('/submit', submitAnswers);

export default router;

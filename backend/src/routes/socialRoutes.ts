import express from 'express';
import {
  getFeed,
  createPost,
  getComments,
  addComment,
  toggleLike
} from '../controllers/socialController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All social routes require authentication
router.use(authenticateToken);

// Feed routes
router.get('/feed', getFeed);
router.post('/posts', createPost);

// Comment routes
router.get('/posts/:postId/comments', getComments);
router.post('/comments', addComment);

// Like routes
router.post('/like', toggleLike);

export default router;

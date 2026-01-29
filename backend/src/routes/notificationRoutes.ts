import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Get notifications
router.get('/', getNotifications);

// Mark notification as read
router.post('/read', markAsRead);

// Mark all notifications as read
router.post('/read-all', markAllAsRead);

export default router;

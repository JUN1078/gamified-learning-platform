import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

// Get user notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 20, offset = 0, unread_only = false } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [userId];

    if (unread_only === 'true' || unread_only === true) {
      query += ' AND is_read = false';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [notifications] = await pool.query<RowDataPacket[]>(query, params);

    // Get unread count
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
      unread_count: countResult[0].unread_count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.body;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead
};

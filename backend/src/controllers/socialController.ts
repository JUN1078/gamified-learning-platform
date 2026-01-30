import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Get social feed
export const getFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT
        sp.*,
        u.username,
        u.avatar_url,
        c.title as user_title,
        c.level as user_level,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = sp.id AND user_id = ?) as user_liked
      FROM social_posts sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN characters c ON u.id = c.user_id
      WHERE 1=1
    `;

    const params: any[] = [userId];

    if (type) {
      query += ' AND sp.post_type = ?';
      params.push(type);
    }

    query += ' ORDER BY sp.is_pinned DESC, sp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [posts] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed'
    });
  }
};

// Create a post
export const createPost = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { postType, content, mediaUrl, relatedLessonId } = req.body;

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!content || content.trim().length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO social_posts (user_id, post_type, content, media_url, related_lesson_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, postType, content, mediaUrl || null, relatedLessonId || null]
    );

    // Update mission progress for post_create
    await updateMissionProgress(connection, userId, 'post_create', 1);

    await connection.commit();

    res.json({
      success: true,
      message: 'Post created successfully',
      data: { postId: result.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  } finally {
    connection.release();
  }
};

// Get comments for a post
export const getComments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;

    const [comments] = await pool.query<RowDataPacket[]>(
      `SELECT
        pc.*,
        u.username,
        u.avatar_url,
        c.title as user_title,
        c.level as user_level,
        EXISTS(SELECT 1 FROM post_likes WHERE comment_id = pc.id AND user_id = ?) as user_liked
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      LEFT JOIN characters c ON u.id = c.user_id
      WHERE pc.post_id = ?
      ORDER BY pc.is_answer DESC, pc.likes_count DESC, pc.created_at ASC`,
      [userId, postId]
    );

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Add a comment
export const addComment = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { postId, content, isAnswer = false } = req.body;

    if (!content || content.trim().length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO post_comments (post_id, user_id, content, is_answer) VALUES (?, ?, ?, ?)',
      [postId, userId, content, isAnswer]
    );

    // Update post comment count
    await connection.query(
      'UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = ?',
      [postId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { commentId: result.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  } finally {
    connection.release();
  }
};

// Like/unlike a post or comment
export const toggleLike = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { targetType, targetId } = req.body; // targetType: 'post' or 'comment'

    // Check if already liked
    const column = targetType === 'post' ? 'post_id' : 'comment_id';
    const [existing] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM post_likes WHERE user_id = ? AND ${column} = ?`,
      [userId, targetId]
    );

    if (existing.length > 0) {
      // Unlike
      await connection.query(
        `DELETE FROM post_likes WHERE user_id = ? AND ${column} = ?`,
        [userId, targetId]
      );

      const table = targetType === 'post' ? 'social_posts' : 'post_comments';
      await connection.query(
        `UPDATE ${table} SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?`,
        [targetId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Unliked',
        liked: false
      });
    } else {
      // Like
      await connection.query(
        `INSERT INTO post_likes (user_id, ${column}) VALUES (?, ?)`,
        [userId, targetId]
      );

      const table = targetType === 'post' ? 'social_posts' : 'post_comments';
      await connection.query(
        `UPDATE ${table} SET likes_count = likes_count + 1 WHERE id = ?`,
        [targetId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Liked',
        liked: true
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  } finally {
    connection.release();
  }
};

// Helper function to update mission progress
async function updateMissionProgress(connection: any, userId: number, targetType: string, incrementValue: number) {
  const [missions] = await connection.query(
    `SELECT m.*, mo.id as objective_id, mo.target_value
     FROM missions m
     JOIN mission_objectives mo ON m.id = mo.mission_id
     WHERE m.is_active = true AND mo.target_type = ?`,
    [targetType]
  );

  for (const mission of (missions as any[])) {
    const [userProgress] = await connection.query(
      `SELECT * FROM user_mission_progress
       WHERE user_id = ? AND mission_id = ? AND status = 'active'`,
      [userId, mission.id]
    );

    if (userProgress.length === 0) {
      const progressData = { [mission.objective_id]: incrementValue };
      await connection.query(
        `INSERT INTO user_mission_progress (user_id, mission_id, progress, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
        [userId, mission.id, JSON.stringify(progressData)]
      );
    } else {
      const currentProgress = JSON.parse(userProgress[0].progress || '{}');
      currentProgress[mission.objective_id] = (currentProgress[mission.objective_id] || 0) + incrementValue;

      if (currentProgress[mission.objective_id] >= mission.target_value) {
        await connection.query(
          `UPDATE user_mission_progress
           SET progress = ?, status = 'completed', completed_at = NOW()
           WHERE id = ?`,
          [JSON.stringify(currentProgress), userProgress[0].id]
        );

        await connection.query(
          'UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?',
          [mission.xp_reward, mission.coin_reward, userId]
        );

        await connection.query(
          `INSERT INTO notifications (user_id, type, title, message, icon)
           VALUES (?, 'mission_complete', ?, ?, ?)`,
          [userId, 'Mission Complete!', `You completed "${mission.title}"!`, mission.icon]
        );
      } else {
        await connection.query(
          'UPDATE user_mission_progress SET progress = ? WHERE id = ?',
          [JSON.stringify(currentProgress), userProgress[0].id]
        );
      }
    }
  }
}

export default {
  getFeed,
  createPost,
  getComments,
  addComment,
  toggleLike
};

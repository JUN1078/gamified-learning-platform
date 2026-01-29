import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

// Get all active missions for user
export const getUserMissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const [missions] = await pool.query<RowDataPacket[]>(
      `SELECT
        m.*,
        ump.id as progress_id,
        COALESCE(ump.status, 'active') as user_status,
        ump.progress,
        ump.started_at,
        ump.completed_at,
        ump.expires_at
      FROM missions m
      LEFT JOIN user_mission_progress ump ON m.id = ump.mission_id AND ump.user_id = ?
      WHERE m.is_active = true
      AND (ump.status IS NULL OR ump.status = 'active' OR ump.status = 'completed')
      ORDER BY
        CASE m.type
          WHEN 'daily' THEN 1
          WHEN 'weekly' THEN 2
          WHEN 'special' THEN 3
          WHEN 'achievement' THEN 4
        END,
        m.id`,
      [userId]
    );

    // Get objectives for each mission
    for (const mission of missions) {
      const [objectives] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM mission_objectives WHERE mission_id = ? ORDER BY order_index ASC',
        [mission.id]
      );

      mission.objectives = objectives.map(obj => {
        const progress = mission.progress ? JSON.parse(mission.progress) : {};
        const currentValue = progress[obj.id] || 0;

        return {
          ...obj,
          current_value: currentValue,
          is_completed: currentValue >= obj.target_value
        };
      });

      // Calculate overall mission progress percentage
      const totalObjectives = mission.objectives.length;
      const completedObjectives = mission.objectives.filter((o: any) => o.is_completed).length;
      mission.progress_percentage = totalObjectives > 0
        ? Math.round((completedObjectives / totalObjectives) * 100)
        : 0;
    }

    res.json({
      success: true,
      data: missions
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch missions'
    });
  }
};

// Claim mission reward
export const claimMissionReward = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { missionId } = req.body;

    // Get mission and progress
    const [missions] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM missions WHERE id = ?',
      [missionId]
    );

    if (missions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    const mission = missions[0];

    const [progress] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM user_mission_progress WHERE user_id = ? AND mission_id = ? AND status = ?',
      [userId, missionId, 'completed']
    );

    if (progress.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Mission not completed or already claimed'
      });
    }

    // Award rewards
    await connection.query(
      'UPDATE users SET xp = xp + ?, coins = coins + ? WHERE id = ?',
      [mission.xp_reward, mission.coin_reward, userId]
    );

    // If badge reward, add badge
    if (mission.badge_reward) {
      const [existingBadge] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
        [userId, mission.badge_reward]
      );

      if (existingBadge.length === 0) {
        await connection.query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
          [userId, mission.badge_reward]
        );
      }
    }

    // Mark as claimed by removing from active missions
    await connection.query(
      'DELETE FROM user_mission_progress WHERE id = ?',
      [progress[0].id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Rewards claimed successfully',
      rewards: {
        xp: mission.xp_reward,
        coins: mission.coin_reward,
        badge: mission.badge_reward
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error claiming mission reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim reward'
    });
  } finally {
    connection.release();
  }
};

export default {
  getUserMissions,
  claimMissionReward
};

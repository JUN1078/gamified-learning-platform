import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Get all available rewards
export const getRewards = async (req: Request, res: Response) => {
  try {
    const { category, type } = req.query;

    let query = 'SELECT * FROM rewards WHERE is_active = true';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY cost_coins ASC';

    const [rewards] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards'
    });
  }
};

// Get user's redeemed rewards
export const getUserRewards = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;

    let query = `
      SELECT
        ur.*,
        r.name,
        r.description,
        r.type,
        r.image_url
      FROM user_rewards ur
      JOIN rewards r ON ur.reward_id = r.id
      WHERE ur.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      query += ' AND ur.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ur.redeemed_at DESC';

    const [userRewards] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: userRewards
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rewards'
    });
  }
};

// Redeem a reward
export const redeemReward = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user?.userId;
    const { rewardId } = req.body;

    // Get reward details
    const [rewards] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM rewards WHERE id = ? AND is_active = true',
      [rewardId]
    );

    if (rewards.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reward not found or unavailable'
      });
    }

    const reward = rewards[0];

    // Check stock
    if (reward.stock !== -1 && reward.stock <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Reward out of stock'
      });
    }

    // Get user coins
    const [users] = await connection.query<RowDataPacket[]>(
      'SELECT coins FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userCoins = users[0].coins;

    // Check if user has enough coins
    if (userCoins < reward.cost_coins) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient coins. You need ${reward.cost_coins} coins but only have ${userCoins}.`
      });
    }

    // Generate redemption code
    const redemptionCode = generateRedemptionCode();

    // Create redemption record
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO user_rewards (user_id, reward_id, redemption_code, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [userId, rewardId, redemptionCode]
    );

    // Deduct coins from user
    await connection.query(
      'UPDATE users SET coins = coins - ? WHERE id = ?',
      [reward.cost_coins, userId]
    );

    // Update stock if not unlimited
    if (reward.stock !== -1) {
      await connection.query(
        'UPDATE rewards SET stock = stock - 1 WHERE id = ?',
        [rewardId]
      );
    }

    // Create notification
    await connection.query(
      `INSERT INTO notifications (user_id, type, title, message, icon)
       VALUES (?, 'reward_redeemed', ?, ?, '🎁')`,
      [
        userId,
        'Reward Redeemed!',
        `You've successfully redeemed "${reward.name}". Code: ${redemptionCode}`
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        redemptionId: result.insertId,
        redemptionCode,
        reward: {
          name: reward.name,
          type: reward.type
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward'
    });
  } finally {
    connection.release();
  }
};

// Helper function to generate redemption code
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-';
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default {
  getRewards,
  getUserRewards,
  redeemReward
};

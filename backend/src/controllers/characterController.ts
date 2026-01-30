import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// @desc    Get character attributes
// @route   GET /api/character/attributes
// @access  Private
export const getCharacter = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const [characters] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM characters WHERE user_id = ?',
      [userId]
    );

    if (characters.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    res.json({
      success: true,
      data: characters[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update character attributes
// @route   PUT /api/character/attributes
// @access  Private
export const updateAttributes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const attributes = req.body;

    // Build the SET clause dynamically for the attributes
    const allowedAttributes = [
      'agility', 'resilience', 'innovation', 'social_intelligence', 'empowerment',
      'analytical_thinking', 'creativity', 'emotional_intelligence', 'leadership',
      'communication', 'adaptability', 'strategic_thinking'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    Object.keys(attributes).forEach((key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedAttributes.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        values.push(attributes[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid attributes to update'
      });
    }

    values.push(userId);

    await pool.query(
      `UPDATE characters SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    // Get updated character
    const [characters] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM characters WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: characters[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get avatar
// @route   GET /api/character/avatar
// @access  Private
export const getAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { avatar_url: users[0].avatar_url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update avatar
// @route   PUT /api/character/avatar
// @access  Private
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { avatar_url } = req.body;

    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatar_url, userId]
    );

    res.json({
      success: true,
      data: { avatar_url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add XP to character
// @route   POST /api/character/xp
// @access  Private
export const addXP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;

    // Get current character
    const [characters] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM characters WHERE user_id = ?',
      [userId]
    );

    if (characters.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    const character = characters[0];
    const newXP = character.xp + amount;

    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(newXP / 100) + 1;

    // Determine title based on level
    let newTitle = 'Novice';
    if (newLevel >= 50) newTitle = 'Grandmaster';
    else if (newLevel >= 40) newTitle = 'Master';
    else if (newLevel >= 30) newTitle = 'Expert';
    else if (newLevel >= 20) newTitle = 'Adept';
    else if (newLevel >= 10) newTitle = 'Apprentice';

    // Update character
    await pool.query(
      'UPDATE characters SET xp = ?, level = ?, title = ? WHERE user_id = ?',
      [newXP, newLevel, newTitle, userId]
    );

    // Get updated character
    const [updatedCharacters] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM characters WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: updatedCharacters[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

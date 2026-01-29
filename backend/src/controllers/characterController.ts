import { Response } from 'express';
import Character from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';

// @desc    Get character attributes
// @route   GET /api/character/attributes
// @access  Private
export const getCharacter = async (req: AuthRequest, res: Response) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    res.json({
      success: true,
      data: character,
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
export const updateAttributes = async (req: AuthRequest, res: Response) => {
  try {
    const { attributes } = req.body;

    const character = await Character.findOne({ userId: req.user._id });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Update attributes
    Object.keys(attributes).forEach((key) => {
      if (character.attributes[key as keyof typeof character.attributes] !== undefined) {
        character.attributes[key as keyof typeof character.attributes] = attributes[key];
      }
    });

    await character.save();

    res.json({
      success: true,
      data: character,
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
export const getAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    res.json({
      success: true,
      data: character.avatar,
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
export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Update avatar fields
    Object.assign(character.avatar, req.body);
    await character.save();

    res.json({
      success: true,
      data: character.avatar,
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
export const addXP = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    const character = await Character.findOne({ userId: req.user._id });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    character.xp += amount;
    (character as any).calculateLevel();
    (character as any).updateTitle();

    await character.save();

    res.json({
      success: true,
      data: character,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

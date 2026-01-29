import express from 'express';
import {
  getCharacter,
  updateAttributes,
  getAvatar,
  updateAvatar,
  addXP,
} from '../controllers/characterController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/attributes', getCharacter);
router.put('/attributes', updateAttributes);
router.get('/avatar', getAvatar);
router.put('/avatar', updateAvatar);
router.post('/xp', addXP);

export default router;

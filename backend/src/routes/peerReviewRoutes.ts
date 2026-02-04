import express from 'express';
import {
  getEmployees,
  getMyReviews,
  getReviewsAboutMe,
  submitPeerReview,
  getAriseRadar,
  getReviewJourney,
  getAriseDimensions
} from '../controllers/peerReviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get list of employees to review
router.get('/employees', getEmployees);

// Get reviews I submitted
router.get('/my-reviews', getMyReviews);

// Get reviews about me
router.get('/reviews-about-me', getReviewsAboutMe);

// Submit a peer review
router.post('/submit', submitPeerReview);

// Get ARISE radar chart data
router.get('/arise-radar/:userId', getAriseRadar);
router.get('/arise-radar', getAriseRadar); // For current user

// Get review journey
router.get('/journey/:userId', getReviewJourney);
router.get('/journey', getReviewJourney); // For current user

// Get ARISE dimensions and statements
router.get('/dimensions', getAriseDimensions);

export default router;

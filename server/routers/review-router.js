import express from 'express';
import authMiddleware from '../middleware/auth-middleware.js';
import reviewController, { uploadFields } from "../controllers/review-controller.js";

const router = express.Router();

router.use(authMiddleware);
router.post('/analyze', uploadFields, reviewController.analyzeResume);
router.route('/history').get(reviewController.getUserReviews);
router.route('/stats').get(reviewController.getUserStats);

export default router;

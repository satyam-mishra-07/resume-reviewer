import express from 'express';
import reviewController from '../controllers/review-controller.js';
import authMiddleware from '../middleware/auth-middleware.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Protected routes - require authentication
router.use(authMiddleware);

// Public route - analyze resume
router.route('/analyze').post(upload.single('resume'), reviewController.analyzeResume);

// Get user's review history - THIS IS THE CORRECT ENDPOINT
router.route('/history').get(reviewController.getUserReviews);

// Get user's review statistics  
router.route('/stats').get(reviewController.getUserStats);

// Other routes...
router.route('/:reviewId').get(reviewController.getReviewById);
router.route('/:reviewId').delete(reviewController.deleteReview);

export default router;

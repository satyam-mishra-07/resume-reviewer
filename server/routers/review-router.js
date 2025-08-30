import express from 'express';
import reviewController from '../controllers/review-controller.js';
import authMiddleware from '../middleware/auth-middleware.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);
router.route('/analyze').post(upload.single('resume'), reviewController.analyzeResume);
router.route('/history').get(reviewController.getUserReviews);
router.route('/stats').get(reviewController.getUserStats);

export default router;

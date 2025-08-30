import express from 'express';
import userController from '../controllers/user-controller.js';
import authMiddleware from '../middleware/auth-middleware.js';

const router = express.Router();

// Protect all routes with authMiddleware (all user routes require authentication)
router.use(authMiddleware);

// Get user profile with stats for Profile Page
router.route('/profile').get(userController.getProfile);

// Update user profile (firstName, lastName)
router.route('/profile').put(userController.updateProfile);

// Delete user account (with all reviews)
router.route('/account').delete(userController.deleteAccount);

export default router;
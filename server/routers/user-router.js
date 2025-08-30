import express from 'express';
import userController from '../controllers/user-controller.js';
import authMiddleware from '../middleware/auth-middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/profile').get(userController.getProfile);
router.route('/profile').put(userController.updateProfile);
router.route('/account').delete(userController.deleteAccount);

export default router;
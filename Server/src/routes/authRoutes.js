import express from 'express';
import { authenticateUser, registerUser, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authenticateUser);
router.post('/register', registerUser);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;

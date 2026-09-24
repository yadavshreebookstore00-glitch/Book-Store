import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.post('/register', registerUser);
router.post('/login', loginUser);

// ===== PROTECTED ROUTES =====
// Verify token
router.get('/verify', protect, verifyToken);

// Get + Update profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
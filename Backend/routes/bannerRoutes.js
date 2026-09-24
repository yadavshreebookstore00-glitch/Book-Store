import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
} from '../controllers/bannerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public — active banners
router.get('/', getActiveBanners);

// Admin — all banners
router.get('/all', protect, admin, getAllBanners);

// Admin — CRUD
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);
router.patch('/:id/toggle', protect, admin, toggleBanner);

export default router;
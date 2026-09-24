import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getWishlist);
router.route('/:bookId').post(protect, toggleWishlist).delete(protect, removeFromWishlist);

export default router;
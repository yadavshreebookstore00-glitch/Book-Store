import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  getSalesSummary,
  getTopSellingItems,
  deleteSale,
} from '../controllers/saleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/summary', protect, admin, getSalesSummary);
router.get('/top-items', protect, admin, getTopSellingItems);

router
  .route('/')
  .get(protect, admin, getSales)
  .post(protect, admin, createSale);

router
  .route('/:id')
  .get(protect, admin, getSaleById)
  .delete(protect, admin, deleteSale);

export default router;
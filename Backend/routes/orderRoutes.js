import express from 'express';
import {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  createCodOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public (Protected)
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentAndCreateOrder);
router.post('/cod', protect, createCodOrder);
router.get('/myorders', protect, getMyOrders);

// Admin
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

// Order by ID (last)
router.get('/:id', protect, getOrderById);

export default router;
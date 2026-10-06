import express from 'express';
import {
  getCustomItems,
  createCustomItem,
  updateCustomItem,
  deleteCustomItem,
} from '../controllers/customItemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, admin, getCustomItems)
  .post(protect, admin, createCustomItem);

router
  .route('/:id')
  .put(protect, admin, updateCustomItem)
  .delete(protect, admin, deleteCustomItem);

export default router;
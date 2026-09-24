import express from 'express';
import {
  getBooks,
  getBookById,
  getBestSellers,
  getCategories,
  getSuggestions, // ✅ New
  createBook,
  updateBook,
  deleteBook,
  addReview,
} from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ⚠️ IMPORTANT: Static routes pehle
router.get('/bestsellers', getBestSellers);
router.get('/categories', getCategories);
router.get('/suggestions', getSuggestions); // ✅ Suggestions route

// CRUD
router.route('/').get(getBooks).post(protect, admin, createBook);

// Dynamic routes (last me)
router
  .route('/:id')
  .get(getBookById)
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

router.post('/:id/reviews', protect, addReview);

export default router;
import express from 'express';
import { generateUpiQr, getUpiInfo } from '../controllers/upiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/info', protect, admin, getUpiInfo);
router.post('/generate-qr', protect, admin, generateUpiQr);

export default router;
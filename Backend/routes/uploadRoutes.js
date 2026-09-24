import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import upload from '../config/multer.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';


const router = express.Router();

// Single image upload
router.post('/', protect, admin, upload.single('image'), uploadImage);

// Delete image
router.delete('/:publicId', protect, admin, deleteImage);

export default router;
import express from 'express';
import {
  sendOtp,
  verifyOtp,
  registerWithOtp,
} from '../controllers/otpController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register-otp', registerWithOtp);

export default router;
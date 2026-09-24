import Otp from '../models/Otp.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ===== Helper: Detect email ya mobile =====
const detectType = (identifier) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/; // Indian 10-digit

  if (emailRegex.test(identifier)) return 'email';
  if (mobileRegex.test(identifier)) return 'mobile';
  return null;
};

// ================= SEND OTP =================
// @route POST /api/auth/send-otp
// @access Public
export const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Email or mobile is required' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const type = detectType(cleanIdentifier);

    if (!type) {
      return res
        .status(400)
        .json({ message: 'Please enter a valid email or 10-digit mobile number' });
    }

    // Delete any previous OTPs for this identifier
    await Otp.deleteMany({ identifier: cleanIdentifier });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await Otp.create({
      identifier: cleanIdentifier,
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    console.log(`📧 OTP for ${cleanIdentifier}: ${otp}`);

    res.json({
      success: true,
      message: `OTP sent to your ${type}`,
      otp, // ⚠️ Dev only - production me hata dein
      type,
      identifier: cleanIdentifier,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY OTP =================
// @route POST /api/auth/verify-otp
// @access Public
export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res
        .status(400)
        .json({ message: 'Identifier and OTP are required' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // ===== Step 1: Find valid OTP =====
    const otpRecord = await Otp.findOne({
      identifier: cleanIdentifier,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ identifier: cleanIdentifier });
      return res
        .status(400)
        .json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    const type = otpRecord.type;

    // ===== Step 2: ADMIN CHECK (ENV se) =====
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (type === 'email' && cleanIdentifier === ADMIN_EMAIL) {
      // Admin login
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });

      if (!adminUser) {
        adminUser = await User.create({
          name: process.env.ADMIN_NAME || 'Admin',
          email: ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          isAdmin: true,
          role: 'admin',
        });
      } else if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        adminUser.role = 'admin';
        await adminUser.save();
      }

      await Otp.deleteMany({ identifier: cleanIdentifier });

      return res.json({
        success: true,
        isNewUser: false,
        message: 'Admin login successful',
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          isAdmin: true,
          role: 'admin',
          token: generateToken(adminUser._id),
        },
      });
    }

    // ===== Step 3: NORMAL USER CHECK (DB se) =====
    let user;
    if (type === 'email') {
      user = await User.findOne({ email: cleanIdentifier });
    } else {
      user = await User.findOne({ phone: cleanIdentifier });
    }

    if (user) {
      // User exists → Login
      await Otp.deleteMany({ identifier: cleanIdentifier });

      return res.json({
        success: true,
        isNewUser: false,
        message: 'OTP verified! Logging in...',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      // New user → Redirect to register
      return res.json({
        success: true,
        isNewUser: true,
        message: 'OTP verified! Please complete registration.',
        identifier: cleanIdentifier,
        type,
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= COMPLETE REGISTRATION =================
// @route POST /api/auth/register-otp
// @access Public
export const registerWithOtp = async (req, res) => {
  try {
    const { identifier, type, name, password } = req.body;

    if (!identifier || !type || !name || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Double check: User already exists?
    let existingUser;
    if (type === 'email') {
      existingUser = await User.findOne({ email: cleanIdentifier });
    } else {
      existingUser = await User.findOne({ phone: cleanIdentifier });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists. Please login.' });
    }

    // Prepare user data
    const userData = { name, password };

    if (type === 'email') {
      userData.email = cleanIdentifier;
    } else {
      userData.phone = cleanIdentifier;
    }

    const user = await User.create(userData);

    // Clean OTP records
    await Otp.deleteMany({ identifier: cleanIdentifier });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Register with OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};
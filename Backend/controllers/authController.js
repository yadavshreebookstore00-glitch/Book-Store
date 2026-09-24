import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ================= REGISTER =================
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= SMART LOGIN (Admin + User) =================
// @route POST /api/auth/login
// @desc  Ek hi endpoint - pehle admin check kare, phir user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    // ===== STEP 1: Admin check (ENV se) =====
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });

      if (!adminUser) {
        adminUser = await User.create({
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          isAdmin: true,
          role: 'admin',
        });
      } else if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        adminUser.role = 'admin';
        await adminUser.save();
      }

      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: true,
        role: 'admin',
        token: generateToken(adminUser._id),
      });
    }

    // ===== STEP 2: Normal user check (DB se) =====
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE =================
// @route GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      phone: user.phone,
      address: user.address,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
// @route PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY TOKEN =================
// @desc  Check if current token is still valid
// @route GET /api/auth/verify
// @access Private
export const verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        isAdmin: req.user.isAdmin,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};
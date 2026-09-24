import User from '../models/User.js';
import Book from '../models/Book.js';

// ===== GET WISHLIST =====
// @route GET /api/wishlist
// @access Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'title image slug price rating stock author'
    );

    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== TOGGLE WISHLIST (Add/Remove) =====
// @route POST /api/wishlist/:bookId
// @access Private
export const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const user = await User.findById(req.user._id);
    const index = user.wishlist.findIndex((id) => id.toString() === bookId);

    let action;
    if (index > -1) {
      // Remove
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      // Add
      user.wishlist.push(bookId);
      action = 'added';
    }

    await user.save();
    await user.populate('wishlist', 'title image slug price rating stock author');

    res.json({ action, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== REMOVE FROM WISHLIST =====
// @route DELETE /api/wishlist/:bookId
// @access Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
    await user.save();

    await user.populate('wishlist', 'title image slug price rating stock author');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
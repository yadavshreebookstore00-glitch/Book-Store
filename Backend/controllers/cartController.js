import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

// ===== GET USER CART =====
// @route GET /api/cart
// @access Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.book',
      'title image slug price stock'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== ADD TO CART =====
// @route POST /api/cart
// @access Private
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if book already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingIndex > -1) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        quantity,
        price: book.price,
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate('items.book', 'title image slug price stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE QUANTITY =====
// @route PUT /api/cart/:bookId
// @access Private
export const updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    await cart.save();

    await cart.populate('items.book', 'title image slug price stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== REMOVE FROM CART =====
// @route DELETE /api/cart/:bookId
// @access Private
export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
    await cart.save();

    await cart.populate('items.book', 'title image slug price stock');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== CLEAR CART =====
// @route DELETE /api/cart
// @access Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
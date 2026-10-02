import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

const POPULATE_FIELDS = "title image slug price stock rating numReviews";

// ---------- Duplicate-request guard (stops double-fire within 1.5s) ----------
const recentAdds = new Map();
const DUPLICATE_WINDOW_MS = 1500;

const isDuplicateAdd = (userId, bookId) => {
  const key = `${userId}:${bookId}`;
  const now = Date.now();
  const last = recentAdds.get(key);

  // cleanup old entries
  for (const [k, t] of recentAdds) {
    if (now - t > DUPLICATE_WINDOW_MS) recentAdds.delete(k);
  }

  if (last && now - last < DUPLICATE_WINDOW_MS) return true;
  recentAdds.set(key, now);
  return false;
};

// ---------- Build the same response everywhere ----------
const buildCartResponse = (cart) => {
  const validItems = (cart.items || []).filter((item) => item.book !== null);

  const totalPrice = validItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems,
    totalPrice,
  };
};

// ============================================================
// GET USER CART (READ ONLY - never changes quantities)
// @route GET /api/cart
// @access Private
// ============================================================
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book",
      POPULATE_FIELDS,
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Remove items whose book was deleted
    const validItems = (cart.items || []).filter((item) => item.book !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(buildCartResponse(cart));
  } catch (error) {
    console.error("❌ Get cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// ADD TO CART
// @route POST /api/cart
// @access Private
// ============================================================
export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Duplicate call within 1.5s -> don't add again, just return current cart
    if (isDuplicateAdd(req.user._id.toString(), bookId.toString())) {
      console.log("⚠️ Duplicate add ignored:", bookId);
      await cart.populate("items.book", POPULATE_FIELDS);
      return res.json(buildCartResponse(cart));
    }

    const existing = cart.items.find(
      (item) => item.book && item.book.toString() === bookId.toString(),
    );

    const newQty = (existing ? existing.quantity : 0) + qty;

    // Never allow quantity above available stock
    if (newQty > book.stock) {
      return res.status(400).json({ message: `Only ${book.stock} in stock` });
    }

    if (existing) {
      existing.quantity = newQty;
      existing.price = book.price;
    } else {
      cart.items.push({ book: bookId, quantity: qty, price: book.price });
    }

    await cart.save();
    await cart.populate("items.book", POPULATE_FIELDS);

    res.json(buildCartResponse(cart));
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// UPDATE CART ITEM QUANTITY (sets exact quantity)
// @route PUT /api/cart/:bookId
// @access Private
// ============================================================
export const updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const quantity = parseInt(req.body.quantity, 10);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.book && i.book.toString() === bookId.toString(),
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    const book = await Book.findById(bookId);
    if (book && quantity > book.stock) {
      return res.status(400).json({ message: `Only ${book.stock} in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.book", POPULATE_FIELDS);

    res.json(buildCartResponse(cart));
  } catch (error) {
    console.error("❌ Update cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// REMOVE FROM CART
// @route DELETE /api/cart/:bookId
// @access Private
// ============================================================
export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.book && i.book.toString() !== bookId.toString(),
    );

    await cart.save();
    await cart.populate("items.book", POPULATE_FIELDS);

    res.json(buildCartResponse(cart));
  } catch (error) {
    console.error("❌ Remove from cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// CLEAR CART
// @route DELETE /api/cart
// @access Private
// ============================================================
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared", items: [], totalPrice: 0 });
  } catch (error) {
    console.error("❌ Clear cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

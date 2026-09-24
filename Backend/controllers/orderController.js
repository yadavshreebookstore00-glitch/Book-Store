import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// ===== CREATE RAZORPAY ORDER =====
// @route POST /api/orders/razorpay
// @access Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // ₹ to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== VERIFY PAYMENT + CREATE ORDER =====
// @route POST /api/orders/verify
// @access Private
export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      items,
    } = req.body;

    // Signature verify
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Calculate totals
    const itemsPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        book: item.book || item._id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentResult: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Payment successful!',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== CREATE COD ORDER =====
// @route POST /api/orders/cod
// @access Private
export const createCodOrder = async (req, res) => {
  try {
    const { shippingAddress, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const itemsPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        book: item.book || item._id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod: 'COD',
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      isPaid: false,
      status: 'Pending',
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET MY ORDERS =====
// @route GET /api/orders/myorders
// @access Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET ORDER BY ID =====
// @route GET /api/orders/:id
// @access Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check ownership or admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET ALL ORDERS (Admin) =====
// @route GET /api/orders
// @access Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE ORDER STATUS (Admin) =====
// @route PUT /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
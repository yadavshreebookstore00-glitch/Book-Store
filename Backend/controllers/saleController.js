import Sale from '../models/Sale.js';
import Book from '../models/Book.js';

// ===== Generate Invoice Number =====
const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await Sale.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// ===== CREATE SALE =====
export const createSale = async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      discountAmount = 0,
      taxAmount = 0,
      paymentMethod = 'Cash',
      paymentStatus = 'Paid',
      notes = '',
      reduceStock = true,
      paidAmount,
      changeReturn = 0,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in sale' });
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const itemTotal = item.price * item.quantity - (item.discount || 0);
      subtotal += itemTotal;

      const isManual = !item.book;
      processedItems.push({
        book: item.book || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        total: itemTotal,
        isManual,
      });

      if (reduceStock && item.book) {
        const book = await Book.findById(item.book);
        if (book) {
          if (book.stock < item.quantity) {
            return res.status(400).json({
              message: `Not enough stock for "${book.title}". Available: ${book.stock}`,
            });
          }
          book.stock -= item.quantity;
          await book.save();
        }
      }
    }

    const totalAmount = subtotal - discountAmount + taxAmount;
    const invoiceNumber = await generateInvoiceNumber();

    const finalPaidAmount =
      paidAmount !== undefined && paidAmount !== null && paidAmount !== ''
        ? Number(paidAmount)
        : totalAmount;

    const finalChangeReturn = Math.max(0, finalPaidAmount - totalAmount);

    const sale = await Sale.create({
      invoiceNumber,
      items: processedItems,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paidAmount: finalPaidAmount,
      changeReturn: finalChangeReturn,
      paymentMethod,
      paymentStatus,
      notes,
      soldBy: req.user._id,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET ALL SALES =====
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, search, paymentMethod } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const count = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate('soldBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      sales,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET SINGLE SALE =====
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('soldBy', 'name email');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== SALES SUMMARY =====
export const getSalesSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const aggregate = async (startDate) => {
      const result = await Sale.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalSales: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } },
          },
        },
      ]);
      return result[0] || { totalRevenue: 0, totalSales: 0, totalItems: 0 };
    };

    const [today, week, month, year] = await Promise.all([
      aggregate(startOfToday),
      aggregate(startOfWeek),
      aggregate(startOfMonth),
      aggregate(startOfYear),
    ]);

    res.json({ today, week, month, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== TOP SELLING ITEMS =====
export const getTopSellingItems = async (req, res) => {
  try {
    const { days = 30, limit = 5 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const topItems = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
    ]);

    res.json(topItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE SALE =====
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    await sale.deleteOne();
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
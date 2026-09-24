import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

// ===== GET DASHBOARD STATS =====
// @route GET /api/dashboard/stats
// @access Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // ===== Counts =====
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();

    // ===== Revenue (only paid orders) =====
    const revenueAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // ===== Order Status Counts =====
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({
      status: 'Processing',
    });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({
      status: 'Delivered',
    });
    const cancelledOrders = await Order.countDocuments({
      status: 'Cancelled',
    });

    // ===== Recent Orders (last 5) =====
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // ===== Low Stock Books (stock <= 5) =====
    const lowStockBooks = await Book.find({ stock: { $lte: 5 } })
      .select('title stock image slug')
      .sort({ stock: 1 })
      .limit(5);

    // ===== Monthly Sales (last 6 months) =====
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format month names
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const salesChartData = monthlySales.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // ===== Top Selling Books (from orders) =====
    const topBooks = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.book',
          title: { $first: '$orderItems.title' },
          image: { $first: '$orderItems.image' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: {
            $sum: {
              $multiply: ['$orderItems.price', '$orderItems.quantity'],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // ===== Category Distribution =====
    const categoryDist = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const categoryChartData = categoryDist.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    // ===== Today's Stats =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });
    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          isPaid: true,
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    // ===== Response =====
    res.json({
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        todayOrders,
        todayRevenue,
      },
      orderStatus: {
        Pending: pendingOrders,
        Processing: processingOrders,
        Shipped: shippedOrders,
        Delivered: deliveredOrders,
        Cancelled: cancelledOrders,
      },
      recentOrders,
      lowStockBooks,
      salesChartData,
      topBooks,
      categoryChartData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};
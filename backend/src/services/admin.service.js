const userRepository = require('../repositories/user.repository');
const transactionRepository = require('../repositories/transaction.repository');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const adminService = {

  // Get all users with pagination
  async getAllUsers(page, limit) {
    return await userRepository.findAll(page, limit);
  },

  // Platform-wide analytics
  async getAnalytics() {
    // Run all queries in parallel for speed
    const [
      totalUsers,
      totalTransactions,
      transactionBreakdown,
      recentTransactions,
    ] = await Promise.all([

      // Total registered users
      User.countDocuments({ role: 'user' }),

      // Total transactions ever
      Transaction.countDocuments(),

      // BUY vs SELL breakdown with totals
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalVolume: { $sum: '$totalAmount' },
          },
        },
      ]),

      // Last 5 transactions platform-wide
      Transaction.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      totalUsers,
      totalTransactions,
      transactionBreakdown,
      recentTransactions,
    };
  },
};

module.exports = adminService;
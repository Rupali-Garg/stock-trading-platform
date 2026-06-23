const Transaction = require('../models/Transaction');

const transactionRepository = {

  // Get transactions with full pagination support
  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      type = null,
      symbol = null,
      startDate = null,
      endDate = null,
    } = options;

    // Build query dynamically
    const query = { userId };

    if (type) query.type = type.toUpperCase();
    if (symbol) query.symbol = symbol.toUpperCase();
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  // Create transaction record
  async create(data) {
    return await Transaction.create(data);
  },

  // Admin: get all transactions across platform
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(),
    ]);

    return {
      transactions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  },

  // Admin analytics: total buy/sell volume
  async getAnalytics() {
    return await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$totalAmount' },
          avgTransactionSize: { $avg: '$totalAmount' },
        },
      },
    ]);
  },
};

module.exports = transactionRepository;
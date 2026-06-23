const Portfolio   = require('../models/Portfolio');
const Holding     = require('../models/Holding');
const Transaction = require('../models/Transaction');
const mongoose    = require('mongoose');

const portfolioRepository = {

  // ── PORTFOLIO ──────────────────────────────────────────────

  async findByUserId(userId) {
    return await Portfolio.findOne({ userId }).populate({
      path:    'holdings',
      options: { sort: { symbol: 1 } },
    });
  },

  async findByUserIdLean(userId) {
    return await Portfolio.findOne({ userId }).lean();
  },

  async create(userId) {
    return await Portfolio.create({
      userId,
      totalInvested:          0,
      totalCurrentValue:      0,
      totalProfitLoss:        0,
      totalProfitLossPercent: 0,
    });
  },

  async updateTotals(portfolioId, totals) {
    return await Portfolio.findByIdAndUpdate(
      portfolioId,
      {
        totalInvested:          totals.totalInvested,
        totalCurrentValue:      totals.totalCurrentValue,
        totalProfitLoss:        totals.totalProfitLoss,
        totalProfitLossPercent: totals.totalProfitLossPercent,
      },
      { new: true }
    );
  },

  // ── HOLDINGS ──────────────────────────────────────────────

  async findHoldingsByPortfolioId(portfolioId) {
    return await Holding.find({ portfolioId }).sort({ symbol: 1 });
  },

  async findHolding(portfolioId, symbol) {
    return await Holding.findOne({
      portfolioId,
      symbol: symbol.toUpperCase(),
    });
  },

  async createHolding(data) {
    return await Holding.create(data);
  },

  async updateHolding(holdingId, data) {
    return await Holding.findByIdAndUpdate(
      holdingId,
      data,
      { new: true, runValidators: true }
    );
  },

  async deleteHolding(holdingId) {
    return await Holding.findByIdAndDelete(holdingId);
  },

  // ── PORTFOLIO SUMMARY AGGREGATION ─────────────────────────
  // Calculates totals inside MongoDB in one query
  // Instead of fetching all holdings and looping in JavaScript

  async getPortfolioSummary(userId) {
    const result = await Holding.aggregate([
      // Stage 1: Only this user's holdings
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      // Stage 2: Sum up all values into one document
      {
        $group: {
          _id:               '$userId',
          totalInvested:     { $sum: '$totalInvested' },
          totalCurrentValue: { $sum: '$currentValue'  },
          totalStocks:       { $sum: 1                },
          totalShares:       { $sum: '$quantity'       },
        },
      },

      // Stage 3: Calculate P&L from the grouped totals
      {
        $addFields: {
          totalProfitLoss: {
            $subtract: ['$totalCurrentValue', '$totalInvested'],
          },
          totalProfitLossPercent: {
            $cond: {
              if:   { $gt: ['$totalInvested', 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalCurrentValue', '$totalInvested'] },
                      '$totalInvested',
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },

      // Stage 4: Round numbers and clean output
      {
        $project: {
          _id:                    0,
          totalInvested:          { $round: ['$totalInvested',          2] },
          totalCurrentValue:      { $round: ['$totalCurrentValue',      2] },
          totalProfitLoss:        { $round: ['$totalProfitLoss',        2] },
          totalProfitLossPercent: { $round: ['$totalProfitLossPercent', 2] },
          totalStocks:            1,
          totalShares:            1,
        },
      },
    ]);

    // Return zeroed summary if user has no holdings
    if (result.length === 0) {
      return {
        totalInvested:          0,
        totalCurrentValue:      0,
        totalProfitLoss:        0,
        totalProfitLossPercent: 0,
        totalStocks:            0,
        totalShares:            0,
      };
    }

    return result[0];
  },

  // ── PERFORMERS ────────────────────────────────────────────

  async getTopPerformers(userId, limit = 3) {
    return await Holding.find({ userId })
      .sort({ profitLossPercent: -1 })
      .limit(limit);
  },

  async getWorstPerformers(userId, limit = 3) {
    return await Holding.find({ userId })
      .sort({ profitLossPercent: 1 })
      .limit(limit);
  },

  // ── MOST TRADED ───────────────────────────────────────────
  // Groups transactions by symbol and counts trades

  async getMostTraded(userId, limit = 5) {
    return await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id:         '$symbol',
          companyName: { $first: '$companyName' },
          tradeCount:  { $sum: 1 },
          totalVolume: { $sum: '$totalAmount' },
          buyCount: {
            $sum: { $cond: [{ $eq: ['$type', 'BUY']  }, 1, 0] },
          },
          sellCount: {
            $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, 1, 0] },
          },
        },
      },
      { $sort: { tradeCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id:         0,
          symbol:      '$_id',
          companyName: 1,
          tradeCount:  1,
          totalVolume: { $round: ['$totalVolume', 2] },
          buyCount:    1,
          sellCount:   1,
        },
      },
    ]);
  },

  // ── TRANSACTIONS ──────────────────────────────────────────

  async createTransaction(data) {
    return await Transaction.create(data);
  },

  // Paginated transaction history
  // Uses compound index { userId: 1, createdAt: -1 }
  async findTransactionsByUserId(userId, page = 1, limit = 10, type = null) {
    const query = { userId };

    if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    const skip = (page - 1) * limit;

    // Run both queries at the same time using Promise.all
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
        pages:       Math.ceil(total / limit),
        currentPage: Number(page),
        limit:       Number(limit),
        hasNextPage: Number(page) < Math.ceil(total / limit),
        hasPrevPage: Number(page) > 1,
      },
    };
  },
};

module.exports = portfolioRepository;
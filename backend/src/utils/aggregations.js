const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Holding     = require('../models/Holding');

// ─────────────────────────────────────────────────────────────
// AGGREGATION 1: Portfolio Summary
// Calculates total invested, current value, P&L
// in ONE database query instead of fetching all holdings
// and calculating in JavaScript
// ─────────────────────────────────────────────────────────────

const getPortfolioSummaryAggregation = async (userId) => {
  const result = await Holding.aggregate([
    // Stage 1: Only look at this user's holdings
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    // Stage 2: Group all holdings into one summary document
    {
      $group: {
        _id: '$userId',

        // Sum of (quantity × averageBuyPrice) for all stocks
        totalInvested: { $sum: '$totalInvested' },

        // Sum of (quantity × currentPrice) for all stocks
        totalCurrentValue: { $sum: '$currentValue' },

        // Count distinct stocks held
        totalStocks: { $sum: 1 },

        // Total shares across all holdings
        totalShares: { $sum: '$quantity' },
      },
    },

    // Stage 3: Calculate P&L from grouped data
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

    // Stage 4: Clean up output — remove internal _id
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

  // Return zeroed summary if no holdings
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
};

// ─────────────────────────────────────────────────────────────
// AGGREGATION 2: Transaction Summary
// Groups transactions by type (BUY/SELL)
// Shows total count and volume for each type
// ─────────────────────────────────────────────────────────────

const getTransactionSummaryAggregation = async (userId) => {
  return await Transaction.aggregate([
    // Stage 1: Only this user's transactions
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    // Stage 2: Group by transaction type
    {
      $group: {
        _id:              '$type',
        count:            { $sum: 1 },
        totalVolume:      { $sum: '$totalAmount' },
        avgTransactionSize: { $avg: '$totalAmount' },
      },
    },

    // Stage 3: Rename _id to type for clarity
    {
      $project: {
        _id:                0,
        type:               '$_id',
        count:              1,
        totalVolume:        { $round: ['$totalVolume',        2] },
        avgTransactionSize: { $round: ['$avgTransactionSize', 2] },
      },
    },
  ]);
};

// ─────────────────────────────────────────────────────────────
// AGGREGATION 3: Most Traded Stocks
// Shows which stocks user trades most frequently
// ─────────────────────────────────────────────────────────────

const getMostTradedStocks = async (userId, limit = 5) => {
  return await Transaction.aggregate([
    // Stage 1: This user only
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    // Stage 2: Group by stock symbol
    {
      $group: {
        _id:         '$symbol',
        companyName: { $first: '$companyName' },
        tradeCount:  { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' },
        buyCount:    {
          $sum: { $cond: [{ $eq: ['$type', 'BUY'] }, 1, 0] },
        },
        sellCount: {
          $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, 1, 0] },
        },
      },
    },

    // Stage 3: Sort by most traded first
    { $sort: { tradeCount: -1 } },

    // Stage 4: Limit results
    { $limit: limit },

    // Stage 5: Clean output
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
};

// ─────────────────────────────────────────────────────────────
// AGGREGATION 4: Admin Platform Analytics
// Platform-wide stats for admin dashboard
// ─────────────────────────────────────────────────────────────

const getPlatformAnalytics = async () => {
  return await Transaction.aggregate([
    // Stage 1: Group ALL transactions by type
    {
      $group: {
        _id:         '$type',
        count:       { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' },
      },
    },

    // Stage 2: Clean output
    {
      $project: {
        _id:         0,
        type:        '$_id',
        count:       1,
        totalVolume: { $round: ['$totalVolume', 2] },
      },
    },
  ]);
};

// ─────────────────────────────────────────────────────────────
// AGGREGATION 5: Monthly Transaction Volume
// Groups transactions by month for charting
// ─────────────────────────────────────────────────────────────

const getMonthlyVolume = async (userId) => {
  return await Transaction.aggregate([
    // Stage 1: This user's transactions
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    // Stage 2: Group by year + month
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalVolume:      { $sum: '$totalAmount' },
        transactionCount: { $sum: 1 },
      },
    },

    // Stage 3: Sort chronologically
    {
      $sort: {
        '_id.year':  1,
        '_id.month': 1,
      },
    },

    // Stage 4: Format output
    {
      $project: {
        _id:              0,
        year:             '$_id.year',
        month:            '$_id.month',
        totalVolume:      { $round: ['$totalVolume', 2] },
        transactionCount: 1,
      },
    },
  ]);
};

module.exports = {
  getPortfolioSummaryAggregation,
  getTransactionSummaryAggregation,
  getMostTradedStocks,
  getPlatformAnalytics,
  getMonthlyVolume,
};
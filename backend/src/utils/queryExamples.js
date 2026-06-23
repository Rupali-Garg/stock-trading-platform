// ─────────────────────────────────────────────────────────────
// This file shows BEFORE vs AFTER optimization examples
// For interview discussion — not used in production
// ─────────────────────────────────────────────────────────────

const Transaction = require('../models/Transaction');
const Holding     = require('../models/Holding');

const queryExamples = {

  // ── EXAMPLE 1: Pagination ─────────────────────────────────

  // BEFORE optimization (no index, no pagination)
  // Fetches ALL transactions into memory
  async badTransactionQuery(userId) {
    const all = await Transaction.find({ userId });
    return all.slice(0, 10); // pagination in JavaScript
    // Problem: loads 10,000 docs to return 10
  },

  // AFTER optimization (compound index + skip/limit)
  // MongoDB uses { userId:1, createdAt:-1 } index
  // Jumps directly to page without loading other docs
  async goodTransactionQuery(userId, page = 1, limit = 10) {
    return await Transaction.find({ userId })
      .sort({ createdAt: -1 })  // index handles this sort
      .skip((page - 1) * limit) // skip at DB level
      .limit(limit);            // limit at DB level
    // Only 10 documents ever loaded into memory
  },

  // ── EXAMPLE 2: Stock Search ───────────────────────────────

  // BEFORE optimization (regex on every document)
  async badStockSearch(query) {
    const Stock = require('../models/Stock');
    return await Stock.find({
      companyName: { $regex: query, $options: 'i' },
    });
    // Problem: scans every stock document
    // 10,000 stocks = 10,000 comparisons
  },

  // AFTER optimization (text index)
  async goodStockSearch(query) {
    const Stock = require('../models/Stock');
    return await Stock.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    // Text index pre-computes matches
    // Returns results in milliseconds
  },

  // ── EXAMPLE 3: Portfolio Summary ──────────────────────────

  // BEFORE optimization (N+1 queries)
  async badPortfolioSummary(userId) {
    const holdings = await Holding.find({ userId });
    // Loop = one extra query per holding
    let total = 0;
    for (const h of holdings) {
      total += h.currentValue; // JavaScript calculation
    }
    return total;
    // 10 holdings = 11 DB queries (1 find + 10 loops)
  },

  // AFTER optimization (single aggregation pipeline)
  async goodPortfolioSummary(userId) {
    const mongoose = require('mongoose');
    const result = await Holding.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$currentValue' } } },
    ]);
    return result[0]?.total || 0;
    // 1 DB query regardless of number of holdings
  },
};

module.exports = queryExamples;
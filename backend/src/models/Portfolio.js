const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    // Which user owns this portfolio
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                   // reference to User collection
      required: true,
    },

    // Summary fields (kept updated for fast dashboard reads)
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCurrentValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Calculated field: totalCurrentValue - totalInvested
    totalProfitLoss: {
      type: Number,
      default: 0,
    },

    totalProfitLossPercent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,

    // Virtual fields are computed properties
    // not stored in DB but available when you call toJSON()
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────
// INDEX: Fast lookup by userId
// This is the most common query: "get portfolio for this user"
// ─────────────────────────────────────────────────────────────
portfolioSchema.index({ userId: 1 });

// ─────────────────────────────────────────────────────────────
// VIRTUAL: holdings
// Instead of storing holdings inside portfolio (which would
// make the document huge), we store them separately and
// virtually "join" them using populate()
// ─────────────────────────────────────────────────────────────
portfolioSchema.virtual('holdings', {
  ref: 'Holding',           // look in Holding collection
  localField: '_id',        // match portfolio._id
  foreignField: 'portfolioId', // with holding.portfolioId
});

// ─────────────────────────────────────────────────────────────
// INSTANCE METHOD: Recalculate summary totals
// Called after every buy/sell
// ─────────────────────────────────────────────────────────────
portfolioSchema.methods.recalculateTotals = function (
  totalInvested,
  totalCurrentValue
) {
  this.totalInvested = totalInvested;
  this.totalCurrentValue = totalCurrentValue;
  this.totalProfitLoss = totalCurrentValue - totalInvested;
  this.totalProfitLossPercent =
    totalInvested > 0
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
      : 0;
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
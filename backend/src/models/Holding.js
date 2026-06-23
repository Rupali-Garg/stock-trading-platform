const mongoose = require('mongoose');

// A Holding = one stock position inside a portfolio
// Example: "User holds 10 shares of AAPL at avg price $180"

const holdingSchema = new mongoose.Schema(
  {
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },

    // Average price paid per share
    // Recalculated on every additional buy
    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Updated when portfolio page loads
    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Calculated: quantity * averageBuyPrice
    totalInvested: {
      type: Number,
      default: 0,
    },

    // Calculated: quantity * currentPrice
    currentValue: {
      type: Number,
      default: 0,
    },

    // Calculated: currentValue - totalInvested
    profitLoss: {
      type: Number,
      default: 0,
    },

    profitLossPercent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// COMPOUND INDEX 1: Find all holdings for a portfolio
// Most frequent query when loading portfolio page
// ─────────────────────────────────────────────────────────────
holdingSchema.index({ portfolioId: 1 });

// ─────────────────────────────────────────────────────────────
// COMPOUND INDEX 2: Find specific stock in specific portfolio
// Used in buy/sell: "Does user already own AAPL?"
// ─────────────────────────────────────────────────────────────
holdingSchema.index({ portfolioId: 1, symbol: 1 });
// unique: true ensures one holding per stock per portfolio

// ─────────────────────────────────────────────────────────────
// COMPOUND INDEX 3: Find all holdings by userId
// ─────────────────────────────────────────────────────────────
holdingSchema.index({ userId: 1 });

// ─────────────────────────────────────────────────────────────
// INSTANCE METHOD: Recalculate holding values
// Called after every price update or trade
// ─────────────────────────────────────────────────────────────
holdingSchema.methods.recalculate = function () {
  this.totalInvested = this.quantity * this.averageBuyPrice;
  this.currentValue = this.quantity * this.currentPrice;
  this.profitLoss = this.currentValue - this.totalInvested;
  this.profitLossPercent =
    this.totalInvested > 0
      ? ((this.currentValue - this.totalInvested) / this.totalInvested) * 100
      : 0;
};

const Holding = mongoose.model('Holding', holdingSchema);

module.exports = Holding;
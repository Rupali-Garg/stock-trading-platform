const mongoose = require('mongoose');

// Transactions are IMMUTABLE — never edited or deleted
// They are a permanent audit trail of every trade

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
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

    type: {
      type: String,
      enum: ['BUY', 'SELL'],         // only these two values
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },

    // Price per share at time of trade
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },

    // Total amount = quantity * price
    totalAmount: {
      type: Number,
      required: true,
    },

    // Optional: notes about the trade
    notes: {
      type: String,
      maxlength: 200,
    },
  },
  {
    timestamps: true,  // createdAt = exact time of trade
  }
);

// ─────────────────────────────────────────────────────────────
// COMPOUND INDEX 1: Get all transactions for a user, newest first
// Most common query: "show my transaction history"
// Without this index: MongoDB scans EVERY transaction
// With this index: jumps directly to user's transactions
// ─────────────────────────────────────────────────────────────
transactionSchema.index({ userId: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────
// COMPOUND INDEX 2: Filter by userId + type (BUY or SELL)
// Used when user filters: "show only my BUY transactions"
// ─────────────────────────────────────────────────────────────
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────
// INDEX 3: Admin analytics — all transactions by date
// Used in admin dashboard to show platform activity over time
// ─────────────────────────────────────────────────────────────
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
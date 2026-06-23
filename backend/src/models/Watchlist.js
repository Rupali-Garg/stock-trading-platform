const mongoose = require('mongoose');

// Each stock entry inside the watchlist
const watchedStockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      uppercase: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    // Price when user added this stock to watchlist
    // Useful for showing "price when added" vs current price
    priceWhenAdded: {
      type: Number,
      default: 0,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Disable _id for subdocuments to keep array clean
    _id: false,
  }
);

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Array of watched stocks (embedded documents)
    // Max 50 stocks per watchlist
    stocks: {
      type: [watchedStockSchema],
      default: [],
      validate: {
        validator: function (stocks) {
          return stocks.length <= 50;
        },
        message: 'Watchlist cannot exceed 50 stocks',
      },
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────

// Fast lookup by userId
watchlistSchema.index({ userId: 1 });

// Fast search inside watchlist stocks
watchlistSchema.index({ 'stocks.symbol': 1 });

// ─────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────

// Check if stock already exists in watchlist
watchlistSchema.methods.hasStock = function (symbol) {
  return this.stocks.some(
    (stock) => stock.symbol === symbol.toUpperCase()
  );
};

// Get specific stock from watchlist
watchlistSchema.methods.getStock = function (symbol) {
  return this.stocks.find(
    (stock) => stock.symbol === symbol.toUpperCase()
  );
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
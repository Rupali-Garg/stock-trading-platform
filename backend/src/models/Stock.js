const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
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

    sector: {
      type: String,
      enum: [
        'Technology',
        'Finance',
        'Healthcare',
        'Energy',
        'Consumer',
        'Industrial',
        'Other',
      ],
      default: 'Other',
    },

    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative'],
    },

    previousClose: {
      type: Number,
      default: 0,
    },

    // Percentage change from previous close
    dayChangePercent: {
      type: Number,
      default: 0,
    },

    // Absolute change from previous close
    dayChange: {
      type: Number,
      default: 0,
    },

    marketCap: {
      type: Number,
      default: 0,
    },

    volume: {
      type: Number,
      default: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,

    // Include virtuals in API responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────

// Fast symbol lookup
stockSchema.index({ symbol: 1 });

// Text search on symbol + company name
stockSchema.index(
  { symbol: 'text', companyName: 'text' },
  {
    weights: {
      symbol: 10,
      companyName: 5,
    },
    name: 'stock_text_index',
  }
);

// Filter by sector
stockSchema.index({ sector: 1 });

// Sort by market cap
stockSchema.index({ marketCap: -1 });

// ─────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────

stockSchema.virtual('priceDirection').get(function () {
  if (this.dayChange > 0) return 'up';
  if (this.dayChange < 0) return 'down';
  return 'neutral';
});

// ─────────────────────────────────────────────────────────────
// PRE-SAVE HOOK
// Auto-calculate daily change metrics
// ─────────────────────────────────────────────────────────────

stockSchema.pre('save', function (next) {
  this.dayChange = this.currentPrice - this.previousClose;

  if (this.previousClose > 0) {
    this.dayChangePercent =
      ((this.currentPrice - this.previousClose) /
        this.previousClose) *
      100;
  } else {
    this.dayChangePercent = 0;
  }

  this.lastUpdated = new Date();

  next();
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
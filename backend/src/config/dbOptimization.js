const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// This file demonstrates all MongoDB optimizations
// Run it once after connecting to MongoDB
// ─────────────────────────────────────────────────────────────

const runOptimizations = async () => {
  try {
    const db = mongoose.connection.db;

    console.log('🔧 Running MongoDB optimizations...');

    // ── USERS COLLECTION ──────────────────────────────────────
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, background: true }
    );
    console.log('✅ users: email index');

    // ── STOCKS COLLECTION ─────────────────────────────────────
    await db.collection('stocks').createIndex(
      { symbol: 1 },
      { unique: true, background: true }
    );
    await db.collection('stocks').createIndex(
      { sector: 1 },
      { background: true }
    );
    await db.collection('stocks').createIndex(
      { marketCap: -1 },
      { background: true }
    );
    // Text index for search
    await db.collection('stocks').createIndex(
      { symbol: 'text', companyName: 'text' },
      { weights: { symbol: 10, companyName: 5 }, name: 'stock_text_index' }
    );
    console.log('✅ stocks: symbol, sector, marketCap, text indexes');

    // ── PORTFOLIOS COLLECTION ─────────────────────────────────
    await db.collection('portfolios').createIndex(
      { userId: 1 },
      { unique: true, background: true }
    );
    console.log('✅ portfolios: userId index');

    // ── HOLDINGS COLLECTION ───────────────────────────────────
    await db.collection('holdings').createIndex(
      { portfolioId: 1 },
      { background: true }
    );
    // Compound unique index — prevents duplicate holdings
    await db.collection('holdings').createIndex(
      { portfolioId: 1, symbol: 1 },
      { unique: true, background: true }
    );
    await db.collection('holdings').createIndex(
      { userId: 1 },
      { background: true }
    );
    console.log('✅ holdings: portfolioId, compound, userId indexes');

    // ── TRANSACTIONS COLLECTION ───────────────────────────────
    // Most important compound index
    // Covers: "get all transactions for user, newest first"
    await db.collection('transactions').createIndex(
      { userId: 1, createdAt: -1 },
      { background: true }
    );
    // Covers: "filter by type + sort by date"
    await db.collection('transactions').createIndex(
      { userId: 1, type: 1, createdAt: -1 },
      { background: true }
    );
    // Covers: admin analytics
    await db.collection('transactions').createIndex(
      { createdAt: -1 },
      { background: true }
    );
    console.log('✅ transactions: compound indexes');

    // ── WATCHLISTS COLLECTION ─────────────────────────────────
    await db.collection('watchlists').createIndex(
      { userId: 1 },
      { unique: true, background: true }
    );
    await db.collection('watchlists').createIndex(
      { 'stocks.symbol': 1 },
      { background: true }
    );
    console.log('✅ watchlists: userId, stocks.symbol indexes');

    console.log('🎉 All optimizations complete');

  } catch (err) {
    // Index already exists — not a problem
    if (err.code === 85 || err.code === 86) {
      console.log('ℹ️  Indexes already exist — skipping');
    } else {
      console.error('❌ Optimization error:', err.message);
    }
  }
};

module.exports = runOptimizations;
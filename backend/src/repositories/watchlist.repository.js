const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

const watchlistRepository = {

  // ── WATCHLIST CRUD ────────────────────────────────────────

  // Find user's watchlist
  async findByUserId(userId) {
    return await Watchlist.findOne({ userId });
  },

  // Create empty watchlist
  async create(userId) {
    return await Watchlist.create({ userId, stocks: [] });
  },

  // Add stock to watchlist using $push
  // MongoDB $push appends to array atomically
  async addStock(userId, stockData) {
    return await Watchlist.findOneAndUpdate(
      { userId },
      {
        $push: {
          stocks: {
            symbol: stockData.symbol.toUpperCase(),
            companyName: stockData.companyName,
            priceWhenAdded: stockData.currentPrice || 0,
            addedAt: new Date(),
          },
        },
      },
      {
        new: true,    // return updated document
        upsert: true, // create if doesn't exist
      }
    );
  },

  // Remove stock from watchlist using $pull
  // MongoDB $pull removes elements matching condition
  async removeStock(userId, symbol) {
    return await Watchlist.findOneAndUpdate(
      { userId },
      {
        $pull: {
          stocks: { symbol: symbol.toUpperCase() },
        },
      },
      { new: true }
    );
  },

  // ── STOCK CATALOGUE QUERIES ───────────────────────────────

  // Full text search using text index
  async searchStocks(query, limit = 10) {
    if (!query || query.trim() === '') {
      // No query — return popular stocks by market cap
      return await Stock.find()
        .sort({ marketCap: -1 })
        .limit(limit)
        .lean();
    }

    // Text search with relevance scoring
    const results = await Stock.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    // If text search returns nothing, try regex fallback
    // (handles partial matches that text index might miss)
    if (results.length === 0) {
      return await Stock.find({
        $or: [
          { symbol: { $regex: query, $options: 'i' } },
          { companyName: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(limit)
        .lean();
    }

    return results;
  },

  // Get all stocks with pagination and optional sector filter
  async getAllStocks(page = 1, limit = 20, sector = null) {
    const query = {};
    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    const skip = (page - 1) * limit;

    const [stocks, total] = await Promise.all([
      Stock.find(query)
        .sort({ marketCap: -1 }) // most valuable stocks first
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Stock.countDocuments(query),
    ]);

    return {
      stocks,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit),
        hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
        hasPrevPage: Number(page) > 1,
      },
    };
  },

  // Get a single stock by symbol
  async findStockBySymbol(symbol) {
    return await Stock.findOne({
      symbol: symbol.toUpperCase(),
    }).lean();
  },

  // Get stocks by multiple symbols at once
  // Used when loading watchlist with current prices
  async findStocksBySymbols(symbols) {
    return await Stock.find({
      symbol: { $in: symbols.map((s) => s.toUpperCase()) },
    }).lean();
  },

  // Get all unique sectors
  async getAllSectors() {
    return await Stock.distinct('sector');
  },

  // Get stocks grouped by sector
  // Used in the browse/explore page
  async getStocksBySector() {
    return await Stock.aggregate([
      {
        $group: {
          _id: '$sector',
          stocks: {
            $push: {
              symbol: '$symbol',
              companyName: '$companyName',
              currentPrice: '$currentPrice',
              dayChangePercent: '$dayChangePercent',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort sectors alphabetically
    ]);
  },
};

module.exports = watchlistRepository;
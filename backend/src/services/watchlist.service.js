const watchlistRepository = require('../repositories/watchlist.repository');
const ApiError = require('../utils/ApiError');

const watchlistService = {

  // ── GET WATCHLIST WITH LIVE PRICES ───────────────────────
  async getWatchlist(userId) {
    // Step 1: Get user's watchlist
    let watchlist = await watchlistRepository.findByUserId(userId);

    // Auto-create if missing
    if (!watchlist) {
      watchlist = await watchlistRepository.create(userId);
      return { watchlist, enrichedStocks: [] };
    }

    if (watchlist.stocks.length === 0) {
      return { watchlist, enrichedStocks: [] };
    }

    // Step 2: Extract all symbols from watchlist
    const symbols = watchlist.stocks.map((s) => s.symbol);

    // Step 3: Fetch current prices for all symbols in one query
    const currentStockData = await watchlistRepository
      .findStocksBySymbols(symbols);

    // Step 4: Create a lookup map for O(1) access
    // { "AAPL": { currentPrice: 185.50, ... } }
    const stockMap = {};
    currentStockData.forEach((stock) => {
      stockMap[stock.symbol] = stock;
    });

    // Step 5: Enrich watchlist with current price data
    const enrichedStocks = watchlist.stocks.map((watchedStock) => {
      const liveData = stockMap[watchedStock.symbol];

      if (!liveData) {
        // Stock data missing — return basic info
        return {
          symbol: watchedStock.symbol,
          companyName: watchedStock.companyName,
          addedAt: watchedStock.addedAt,
          priceWhenAdded: watchedStock.priceWhenAdded,
          currentPrice: null,
          dayChange: null,
          dayChangePercent: null,
          error: 'Price data unavailable',
        };
      }

      // Calculate change since user added to watchlist
      const changeFromAdded =
        watchedStock.priceWhenAdded > 0
          ? liveData.currentPrice - watchedStock.priceWhenAdded
          : 0;

      const changeFromAddedPercent =
        watchedStock.priceWhenAdded > 0
          ? ((changeFromAdded / watchedStock.priceWhenAdded) * 100)
          : 0;

      return {
        symbol: watchedStock.symbol,
        companyName: watchedStock.companyName,
        sector: liveData.sector,
        addedAt: watchedStock.addedAt,
        priceWhenAdded: watchedStock.priceWhenAdded,
        currentPrice: liveData.currentPrice,
        previousClose: liveData.previousClose,
        dayChange: liveData.dayChange,
        dayChangePercent: liveData.dayChangePercent,
        changeFromAdded: parseFloat(changeFromAdded.toFixed(2)),
        changeFromAddedPercent: parseFloat(
          changeFromAddedPercent.toFixed(2)
        ),
      };
    });

    // Sort: biggest gainers today first
    enrichedStocks.sort(
      (a, b) => (b.dayChangePercent || 0) - (a.dayChangePercent || 0)
    );

    return { watchlist, enrichedStocks };
  },

  // ── ADD STOCK ─────────────────────────────────────────────
  async addStock(userId, symbol) {
    const upperSymbol = symbol.toUpperCase();

    // Step 1: Verify stock exists
    const stock = await watchlistRepository.findStockBySymbol(upperSymbol);
    if (!stock) {
      throw new ApiError(404, `Stock ${upperSymbol} not found`);
    }

    // Step 2: Get or create watchlist
    let watchlist = await watchlistRepository.findByUserId(userId);
    if (!watchlist) {
      watchlist = await watchlistRepository.create(userId);
    }

    // Step 3: Check watchlist limit
    if (watchlist.stocks.length >= 50) {
      throw new ApiError(
        400,
        'Watchlist full. Maximum 50 stocks allowed. Remove some to add more.'
      );
    }

    // Step 4: Check for duplicate
    if (watchlist.hasStock(upperSymbol)) {
      throw new ApiError(
        409,
        `${upperSymbol} is already in your watchlist`
      );
    }

    // Step 5: Add stock with current price snapshot
    const updatedWatchlist = await watchlistRepository.addStock(userId, {
      symbol: upperSymbol,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice,
    });

    return {
      watchlist: updatedWatchlist,
      addedStock: {
        symbol: upperSymbol,
        companyName: stock.companyName,
        currentPrice: stock.currentPrice,
      },
    };
  },

  // ── REMOVE STOCK ──────────────────────────────────────────
  async removeStock(userId, symbol) {
    const upperSymbol = symbol.toUpperCase();

    // Check watchlist exists and has the stock
    const watchlist = await watchlistRepository.findByUserId(userId);
    if (!watchlist) {
      throw new ApiError(404, 'Watchlist not found');
    }

    if (!watchlist.hasStock(upperSymbol)) {
      throw new ApiError(
        404,
        `${upperSymbol} is not in your watchlist`
      );
    }

    return await watchlistRepository.removeStock(userId, upperSymbol);
  },

  // ── SEARCH STOCKS ─────────────────────────────────────────
  async searchStocks(query, limit = 10) {
    const stocks = await watchlistRepository.searchStocks(query, limit);
    return stocks;
  },

  // ── GET ALL STOCKS WITH PAGINATION ───────────────────────
  async getAllStocks(page, limit, sector) {
    return await watchlistRepository.getAllStocks(page, limit, sector);
  },

  // ── GET SECTORS ───────────────────────────────────────────
  async getSectors() {
    const sectors = await watchlistRepository.getAllSectors();
    return ['All', ...sectors.sort()];
  },

  // ── GET STOCKS BY SECTOR ──────────────────────────────────
  async getStocksBySector() {
    return await watchlistRepository.getStocksBySector();
  },

  // ── GET SINGLE STOCK ──────────────────────────────────────
  async getStock(symbol) {
    const stock = await watchlistRepository.findStockBySymbol(symbol);
    if (!stock) {
      throw new ApiError(404, `Stock ${symbol.toUpperCase()} not found`);
    }
    return stock;
  },
};

module.exports = watchlistService;
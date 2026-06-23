const watchlistService = require('../services/watchlist.service');

const getWatchlist = async (req, res) => {
  try {
    const result = await watchlistService.getWatchlist(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Watchlist fetched',
      data:    result,
    });
  } catch (err) {
    console.error('WATCHLIST ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch watchlist',
    });
  }
};

const addStock = async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required',
      });
    }
    const result = await watchlistService.addStock(req.user.userId, symbol);
    res.status(200).json({
      success: true,
      message: `${symbol.toUpperCase()} added to watchlist`,
      data:    result,
    });
  } catch (err) {
    console.error('ADD STOCK ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to add stock',
    });
  }
};

const removeStock = async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required',
      });
    }
    const result = await watchlistService.removeStock(req.user.userId, symbol);
    res.status(200).json({
      success: true,
      message: `${symbol.toUpperCase()} removed from watchlist`,
      data:    result,
    });
  } catch (err) {
    console.error('REMOVE STOCK ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to remove stock',
    });
  }
};

const searchStocks = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const stocks = await watchlistService.searchStocks(q, Number(limit));
    res.status(200).json({
      success: true,
      message: 'Search results fetched',
      data:    stocks,
    });
  } catch (err) {
    console.error('SEARCH ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Search failed',
    });
  }
};

const getAllStocks = async (req, res) => {
  try {
    const { page = 1, limit = 20, sector } = req.query;
    const result = await watchlistService.getAllStocks(
      Number(page),
      Number(limit),
      sector
    );
    res.status(200).json({
      success: true,
      message: 'Stocks fetched',
      data:    result,
    });
  } catch (err) {
    console.error('GET STOCKS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch stocks',
    });
  }
};

const getSectors = async (req, res) => {
  try {
    const sectors = await watchlistService.getSectors();
    res.status(200).json({
      success: true,
      message: 'Sectors fetched',
      data:    sectors,
    });
  } catch (err) {
    console.error('SECTORS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch sectors',
    });
  }
};

const getStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await watchlistService.getStock(symbol);
    res.status(200).json({
      success: true,
      message: 'Stock fetched',
      data:    stock,
    });
  } catch (err) {
    console.error('GET STOCK ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch stock',
    });
  }
};

module.exports = {
  getWatchlist,
  addStock,
  removeStock,
  searchStocks,
  getAllStocks,
  getSectors,
  getStock,
};
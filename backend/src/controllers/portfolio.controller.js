const portfolioService = require('../services/portfolio.service');

const getPortfolio = async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Portfolio fetched',
      data:    portfolio,
    });
  } catch (err) {
    console.error('GET PORTFOLIO ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch portfolio',
    });
  }
};

const getPortfolioSummary = async (req, res) => {
  try {
    const summary = await portfolioService.getPortfolioSummary(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Summary fetched',
      data:    summary,
    });
  } catch (err) {
    console.error('SUMMARY ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch summary',
    });
  }
};

const buyStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const portfolio = await portfolioService.buyStock(
      req.user.userId,
      symbol,
      Number(quantity),
      Number(price)
    );
    res.status(200).json({
      success: true,
      message: `Bought ${quantity} shares of ${symbol}`,
      data:    portfolio,
    });
  } catch (err) {
    console.error('BUY ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Buy failed',
    });
  }
};

const sellStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const portfolio = await portfolioService.sellStock(
      req.user.userId,
      symbol,
      Number(quantity),
      Number(price)
    );
    res.status(200).json({
      success: true,
      message: `Sold ${quantity} shares of ${symbol}`,
      data:    portfolio,
    });
  } catch (err) {
    console.error('SELL ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Sell failed',
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const result = await portfolioService.getTransactions(
      req.user.userId,
      Number(page),
      Number(limit),
      type
    );
    res.status(200).json({
      success: true,
      message: 'Transactions fetched',
      data:    result,
    });
  } catch (err) {
    console.error('TRANSACTIONS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch transactions',
    });
  }
};

module.exports = {
  getPortfolio,
  getPortfolioSummary,
  buyStock,
  sellStock,
  getTransactions,
};
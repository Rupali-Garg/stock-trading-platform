const portfolioRepository = require('../repositories/portfolio.repository');
const watchlistRepository = require('../repositories/watchlist.repository');
const ApiError = require('../utils/ApiError');

// ─────────────────────────────────────────────────────────────
// CALCULATION HELPERS
// Pure functions — no database calls
// Easy to unit test independently
// ─────────────────────────────────────────────────────────────

// Calculate new average buy price when adding to a position
// Formula: (oldQty × oldAvg + newQty × newPrice) / (oldQty + newQty)
const calculateNewAverageBuyPrice = (
  oldQuantity,
  oldAverageBuyPrice,
  newQuantity,
  newPrice
) => {
  const totalCost =
    oldQuantity * oldAverageBuyPrice + newQuantity * newPrice;
  const totalQuantity = oldQuantity + newQuantity;
  return totalCost / totalQuantity;
};

// Calculate profit/loss values for a holding
const calculateHoldingPL = (quantity, averageBuyPrice, currentPrice) => {
  const totalInvested = quantity * averageBuyPrice;
  const currentValue = quantity * currentPrice;
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent =
    totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
  };
};

// Calculate portfolio-level totals from array of holdings
const calculatePortfolioTotals = (holdings) => {
  let totalInvested = 0;
  let totalCurrentValue = 0;

  holdings.forEach((h) => {
    totalInvested += h.totalInvested || 0;
    totalCurrentValue += h.currentValue || 0;
  });

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent =
    totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
    totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
    totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
  };
};

// ─────────────────────────────────────────────────────────────
// PORTFOLIO SERVICE
// ─────────────────────────────────────────────────────────────

const portfolioService = {

  // ── GET PORTFOLIO ─────────────────────────────────────────
  async getPortfolio(userId) {
    let portfolio = await portfolioRepository.findByUserId(userId);

    // Auto-create if missing (safety net)
    if (!portfolio) {
      portfolio = await portfolioRepository.create(userId);
    }

    return portfolio;
  },

  // ── GET PORTFOLIO SUMMARY ─────────────────────────────────
  // Uses aggregation pipeline for accurate live numbers
  async getPortfolioSummary(userId) {
    const [summary, topPerformers, worstPerformers] = await Promise.all([
      portfolioRepository.getPortfolioSummary(userId),
      portfolioRepository.getTopPerformers(userId, 3),
      portfolioRepository.getWorstPerformers(userId, 3),
    ]);

    return {
      summary,
      topPerformers,
      worstPerformers,
    };
  },

  // ── BUY STOCK ─────────────────────────────────────────────
  async buyStock(userId, symbol, quantity, price) {

    // ── INPUT VALIDATION ────────────────────────────────────
    const upperSymbol = symbol.toUpperCase();

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, 'Quantity must be a positive whole number');
    }

    if (typeof price !== 'number' || price <= 0) {
      throw new ApiError(400, 'Price must be a positive number');
    }

    // ── STOCK VERIFICATION ──────────────────────────────────
    const stock = await watchlistRepository.findStockBySymbol(upperSymbol);
    if (!stock) {
      throw new ApiError(404, `Stock ${upperSymbol} not found in catalogue`);
    }

    // ── GET OR CREATE PORTFOLIO ─────────────────────────────
    let portfolio = await portfolioRepository.findByUserIdLean(userId);
    if (!portfolio) {
      portfolio = await portfolioRepository.create(userId);
    }

    // ── CHECK EXISTING HOLDING ──────────────────────────────
    const existingHolding = await portfolioRepository.findHolding(
      portfolio._id,
      upperSymbol
    );

    if (existingHolding) {

      // ── CASE 1: ADDITIONAL BUY (already own this stock) ───
      // Recalculate weighted average buy price
      const newQuantity = existingHolding.quantity + quantity;

      const newAverageBuyPrice = calculateNewAverageBuyPrice(
        existingHolding.quantity,
        existingHolding.averageBuyPrice,
        quantity,
        price
      );

      const plValues = calculateHoldingPL(
        newQuantity,
        newAverageBuyPrice,
        price  // current price = purchase price at time of buy
      );

      await portfolioRepository.updateHolding(existingHolding._id, {
        quantity: newQuantity,
        averageBuyPrice: parseFloat(newAverageBuyPrice.toFixed(4)),
        currentPrice: price,
        ...plValues,
      });

    } else {

      // ── CASE 2: NEW HOLDING (first time buying this stock) ─
      const plValues = calculateHoldingPL(quantity, price, price);

      await portfolioRepository.createHolding({
        portfolioId: portfolio._id,
        userId,
        symbol: upperSymbol,
        companyName: stock.companyName,
        quantity,
        averageBuyPrice: price,
        currentPrice: price,
        ...plValues,
      });
    }

    // ── RECORD TRANSACTION ──────────────────────────────────
    const totalAmount = parseFloat((quantity * price).toFixed(2));

    await portfolioRepository.createTransaction({
      userId,
      portfolioId: portfolio._id,
      symbol: upperSymbol,
      companyName: stock.companyName,
      type: 'BUY',
      quantity,
      price,
      totalAmount,
    });

    // ── RECALCULATE PORTFOLIO TOTALS ────────────────────────
    await portfolioService._recalculateTotals(portfolio._id);

    // ── RETURN UPDATED PORTFOLIO ────────────────────────────
    return await portfolioRepository.findByUserId(userId);
  },

  // ── SELL STOCK ────────────────────────────────────────────
  async sellStock(userId, symbol, quantity, price) {

    const upperSymbol = symbol.toUpperCase();

    // ── INPUT VALIDATION ────────────────────────────────────
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, 'Quantity must be a positive whole number');
    }

    if (typeof price !== 'number' || price <= 0) {
      throw new ApiError(400, 'Price must be a positive number');
    }

    // ── GET PORTFOLIO ────────────────────────────────────────
    const portfolio = await portfolioRepository.findByUserIdLean(userId);
    if (!portfolio) {
      throw new ApiError(404, 'Portfolio not found');
    }

    // ── FIND HOLDING ─────────────────────────────────────────
    const holding = await portfolioRepository.findHolding(
      portfolio._id,
      upperSymbol
    );

    // ── EDGE CASE 1: Stock not owned ─────────────────────────
    if (!holding) {
      throw new ApiError(
        400,
        `You do not own any shares of ${upperSymbol}`
      );
    }

    // ── EDGE CASE 2: Selling more than owned ─────────────────
    if (quantity > holding.quantity) {
      throw new ApiError(
        400,
        `Cannot sell ${quantity} shares. You only own ${holding.quantity} shares of ${upperSymbol}`
      );
    }

    const newQuantity = holding.quantity - quantity;
    const saleAmount = parseFloat((quantity * price).toFixed(2));

    if (newQuantity === 0) {

      // ── CASE 1: FULL SELL (selling all shares) ────────────
      // Delete the holding completely
      await portfolioRepository.deleteHolding(holding._id);

    } else {

      // ── CASE 2: PARTIAL SELL (keeping some shares) ────────
      // Average buy price stays the same after selling
      // (you're not buying at a new price, just reducing quantity)
      const plValues = calculateHoldingPL(
        newQuantity,
        holding.averageBuyPrice,  // unchanged
        price
      );

      await portfolioRepository.updateHolding(holding._id, {
        quantity: newQuantity,
        currentPrice: price,
        ...plValues,
      });
    }

    // ── RECORD TRANSACTION ───────────────────────────────────
    await portfolioRepository.createTransaction({
      userId,
      portfolioId: portfolio._id,
      symbol: upperSymbol,
      companyName: holding.companyName,
      type: 'SELL',
      quantity,
      price,
      totalAmount: saleAmount,
    });

    // ── RECALCULATE PORTFOLIO TOTALS ─────────────────────────
    await portfolioService._recalculateTotals(portfolio._id);

    // ── RETURN UPDATED PORTFOLIO ─────────────────────────────
    return await portfolioRepository.findByUserId(userId);
  },

  // ── RECALCULATE PORTFOLIO TOTALS (PRIVATE) ────────────────
  // Called internally after every buy/sell
  // Prefixed with _ to indicate it's internal only
  async _recalculateTotals(portfolioId) {
    // Get fresh holdings after the buy/sell
    const holdings = await portfolioRepository
      .findHoldingsByPortfolioId(portfolioId);

    // Calculate totals from current holding values
    const totals = calculatePortfolioTotals(holdings);

    // Persist updated totals to portfolio document
    await portfolioRepository.updateTotals(portfolioId, totals);
  },

  // ── GET TRANSACTIONS ──────────────────────────────────────
  async getTransactions(userId, page, limit, type) {
    return await portfolioRepository.findTransactionsByUserId(
      userId,
      page,
      limit,
      type
    );
  },
};

module.exports = portfolioService;
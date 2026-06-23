const transactionService = require('../services/transaction.service');

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, symbol, startDate, endDate } =
      req.query;
    const result = await transactionService.getTransactions(
      req.user.userId,
      { page, limit, type, symbol, startDate, endDate }
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

module.exports = { getTransactions };
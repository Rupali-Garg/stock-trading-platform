const adminService       = require('../services/admin.service');
const transactionService = require('../services/transaction.service');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllUsers(page, limit);
    res.status(200).json({
      success: true,
      message: 'Users fetched',
      data:    result,
    });
  } catch (err) {
    console.error('ADMIN USERS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch users',
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.status(200).json({
      success: true,
      message: 'Analytics fetched',
      data:    analytics,
    });
  } catch (err) {
    console.error('ANALYTICS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch analytics',
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await transactionService.getAllTransactions(page, limit);
    res.status(200).json({
      success: true,
      message: 'All transactions fetched',
      data:    result,
    });
  } catch (err) {
    console.error('ALL TRANSACTIONS ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch transactions',
    });
  }
};

module.exports = { getAllUsers, getAnalytics, getAllTransactions };
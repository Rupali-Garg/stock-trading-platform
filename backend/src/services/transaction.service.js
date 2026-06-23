const transactionRepository = require('../repositories/transaction.repository');

const transactionService = {

  async getTransactions(userId, options) {
    return await transactionRepository.findByUserId(userId, options);
  },

  async getAllTransactions(page, limit) {
    return await transactionRepository.findAll(page, limit);
  },

  async getAnalytics() {
    return await transactionRepository.getAnalytics();
  },
};

module.exports = transactionService;
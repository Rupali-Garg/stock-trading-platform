import api from './api';

const portfolioService = {
  getPortfolio: () => api.get('/portfolio'),
  getSummary: () => api.get('/portfolio/summary'),
  buyStock: (data) => api.post('/portfolio/buy', data),
  sellStock: (data) => api.post('/portfolio/sell', data),
  getTransactions: (params) =>
    api.get('/portfolio/transactions', { params }),
};

export default portfolioService;
import api from './api';

const watchlistService = {
  getWatchlist: () => api.get('/watchlist'),
  addStock: (symbol) => api.post('/watchlist/add', { symbol }),
  removeStock: (symbol) =>
    api.delete('/watchlist/remove', { params: { symbol } }),
  searchStocks: (q, limit = 10) =>
    api.get('/watchlist/search', { params: { q, limit } }),
  getAllStocks: (params) => api.get('/watchlist/stocks', { params }),
  getSectors: () => api.get('/watchlist/sectors'),
  getStock: (symbol) => api.get(`/watchlist/stock/${symbol}`),
};

export default watchlistService;
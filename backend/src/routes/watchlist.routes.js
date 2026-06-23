const express  = require('express');
const router   = express.Router();
const { protect } = require('../middlewares/auth.middleware');

const {
  getWatchlist,
  addStock,
  removeStock,
  searchStocks,
  getAllStocks,
  getSectors,
  getStock,
} = require('../controllers/watchlist.controller');

// All routes require login
router.use(protect);

router.get('/',                getWatchlist);
router.post('/add',            addStock);
router.delete('/remove',       removeStock);
router.get('/search',          searchStocks);
router.get('/stocks',          getAllStocks);
router.get('/sectors',         getSectors);
router.get('/stock/:symbol',   getStock);

module.exports = router;
const express  = require('express');
const router   = express.Router();
const { protect } = require('../middlewares/auth.middleware');

const {
  getPortfolio,
  getPortfolioSummary,
  buyStock,
  sellStock,
  getTransactions,
} = require('../controllers/portfolio.controller');

const validate = require('../middlewares/validate.middleware');
const {
  buyStockValidator,
  sellStockValidator,
} = require('../validators/portfolio.validator');

router.use(protect);

router.get('/',              getPortfolio);
router.get('/summary',       getPortfolioSummary);
router.get('/transactions',  getTransactions);
router.post('/buy',          buyStockValidator, validate, buyStock);
router.post('/sell',         sellStockValidator, validate, sellStock);

module.exports = router;
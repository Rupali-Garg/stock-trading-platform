const express  = require('express');
const router   = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getTransactions } = require('../controllers/transaction.controller');

router.use(protect);

router.get('/', getTransactions);

module.exports = router;
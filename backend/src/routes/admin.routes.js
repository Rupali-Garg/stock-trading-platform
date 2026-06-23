const express  = require('express');
const router   = express.Router();
const { protect }  = require('../middlewares/auth.middleware');
const rbac         = require('../middlewares/rbac.middleware');

const {
  getAllUsers,
  getAnalytics,
  getAllTransactions,
} = require('../controllers/admin.controller');

router.use(protect);
router.use(rbac('admin'));

router.get('/users',        getAllUsers);
router.get('/analytics',    getAnalytics);
router.get('/transactions', getAllTransactions);

module.exports = router;
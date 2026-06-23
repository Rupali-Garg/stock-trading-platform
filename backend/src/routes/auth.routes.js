const express  = require('express');
const router   = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const validate    = require('../middlewares/validate.middleware');
const { loginLimiter, registerLimiter } =
  require('../middlewares/rateLimiter.middleware');
const { registerValidator, loginValidator } =
  require('../validators/auth.validator');
const {
  register,
  login,
  refresh,
  logout,
  getProfile,
} = require('../controllers/auth.controller');

router.post('/register', registerLimiter, registerValidator, validate, register);
router.post('/login',    loginLimiter,    loginValidator,    validate, login);
router.post('/refresh',  refresh);
router.post('/logout',   protect, logout);
router.get('/profile',   protect, getProfile);

module.exports = router;
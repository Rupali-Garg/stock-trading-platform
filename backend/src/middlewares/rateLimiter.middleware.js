const loginLimiter    = (req, res, next) => next();
const apiLimiter      = (req, res, next) => next();
const registerLimiter = (req, res, next) => next();

module.exports = { loginLimiter, apiLimiter, registerLimiter };
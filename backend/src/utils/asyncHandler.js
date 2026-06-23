// Problem: Every async controller function needs try/catch
// Without this, an unhandled promise rejection crashes the server
//
// Solution: Wrap every async function with asyncHandler
// It catches any error and forwards it to Express error handler
//
// Usage:
// router.post('/login', asyncHandler(authController.login))
//
// Instead of:
// router.post('/login', async (req, res, next) => {
//   try { ... } catch(err) { next(err) }
// })

// REPLACE the entire file with this

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = asyncHandler;
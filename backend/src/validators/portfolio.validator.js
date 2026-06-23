const { body } = require('express-validator');

const buyStockValidator = [
  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('Symbol is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Invalid symbol')
    .toUpperCase(),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Quantity must be between 1 and 100,000'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Price must be between $0.01 and $1,000,000'),
];

const sellStockValidator = [
  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('Symbol is required')
    .toUpperCase(),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Quantity must be between 1 and 100,000'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Price must be between $0.01 and $1,000,000'),
];

const watchlistValidator = [
  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('Symbol is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Invalid symbol length')
    .toUpperCase(),
];

module.exports = {
  buyStockValidator,
  sellStockValidator,
  watchlistValidator,
};
const express         = require('express');
const cors            = require('cors');
const helmet          = require('helmet');
const cookieParser    = require('cookie-parser');
const mongoSanitize   = require('express-mongo-sanitize');
const hpp             = require('hpp');
const errorHandler    = require('./middlewares/error.middleware');

const app = express();

// ─────────────────────────────────────────────────────────────
// SECURITY HEADERS — Helmet
// Sets 14 HTTP headers that protect against common attacks
// ─────────────────────────────────────────────────────────────
app.use(helmet({
  // Content Security Policy
  // Controls what resources browser is allowed to load
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  // Prevents clickjacking — page cannot be loaded in iframe
  frameguard: { action: 'deny' },
  // Forces HTTPS
  hsts: {
    maxAge:            31536000, // 1 year in seconds
    includeSubDomains: true,
  },
  // Prevents MIME type sniffing
  noSniff: true,
  // Blocks pages from loading when XSS detected
  xssFilter: true,
}));

// ─────────────────────────────────────────────────────────────
// CORS — Cross Origin Resource Sharing
// Only allows your frontend domain to call this API
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials:    true,   // required for cookies to work
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
}));

// ─────────────────────────────────────────────────────────────
// BODY PARSERS
// limit: '10kb' prevents large payload DOS attacks
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// NOSQL INJECTION PROTECTION
// Strips $ and . from req.body, req.params, req.query
//
// Example attack without this:
//   POST /login { "email": { "$gt": "" }, "password": "anything" }
//   This would match ALL users in MongoDB
//
// With mongoSanitize:
//   The $gt gets stripped before it reaches the database
// ─────────────────────────────────────────────────────────────
app.use(mongoSanitize({
  replaceWith: '_', // replace $ with _ instead of removing
}));

// ─────────────────────────────────────────────────────────────
// HTTP PARAMETER POLLUTION PROTECTION
// Prevents: /api?sort=name&sort=email (duplicate params)
// Keeps the last value, removes duplicates
// ─────────────────────────────────────────────────────────────
app.use(hpp());

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const portfolioRoutes   = require('./routes/portfolio.routes');
const watchlistRoutes   = require('./routes/watchlist.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes       = require('./routes/admin.routes');

app.use('/api/auth',         authRoutes);
app.use('/api/portfolio',    portfolioRoutes);
app.use('/api/watchlist',    watchlistRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin',        adminRoutes);

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status:      'OK',
    timestamp:   new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────
app.use('*path', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER — must be last
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
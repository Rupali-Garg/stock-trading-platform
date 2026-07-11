const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const cookieParser   = require('cookie-parser');
const mongoSanitize  = require('express-mongo-sanitize');
const hpp            = require('hpp');
const errorHandler   = require('./middlewares/error.middleware');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff:   true,
  xssFilter: true,
}));

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://stock-trading-platform-zeta.vercel.app',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
}));

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── NoSQL injection protection ────────────────────────────────
app.use(mongoSanitize({ replaceWith: '_' }));

// ── HTTP parameter pollution protection ──────────────────────
app.use(hpp());

// ── Routes ────────────────────────────────────────────────────
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

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status:      'OK',
    timestamp:   new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use('*path', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler — must be last ──────────────────────
app.use(errorHandler);

module.exports = app;
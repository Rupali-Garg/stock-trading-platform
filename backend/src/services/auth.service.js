const jwt            = require('jsonwebtoken');
const ApiError       = require('../utils/ApiError');
const userRepository = require('../repositories/user.repository');

// ── Token generators ──────────────────────────────────────────

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// ── Service ───────────────────────────────────────────────────

const authService = {

  async register(name, email, password) {
    // Check duplicate email
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Create user (password hashed by pre-save hook in User model)
    const user = await userRepository.create({ name, email, password });

    // Create empty portfolio + watchlist
    const Portfolio = require('../models/Portfolio');
    const Watchlist = require('../models/Watchlist');

    await Portfolio.create({ userId: user._id });
    await Watchlist.create({ userId: user._id, stocks: [] });

    return {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account deactivated');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    await userRepository.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    };
  },

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new ApiError(401, 'Refresh token revoked');
    }

    return {
      accessToken: generateAccessToken(user._id, user.role),
    };
  },

  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    };
  },
};

module.exports = authService;
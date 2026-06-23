const User = require('../models/User');

const userRepository = {

  async findByEmail(email) {
    return await User.findOne({ email })
      .select('+password +refreshToken');
  },

  async findById(id) {
    return await User.findById(id);
  },

  async create(data) {
    return await User.create(data);
  },

  async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  },

  async findByRefreshToken(refreshToken) {
    return await User.findOne({ refreshToken })
      .select('+refreshToken');
  },

  async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { new: true }
    );
  },

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({ role: 'user' })
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ role: 'user' }),
    ]);
    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  },
};

module.exports = userRepository;
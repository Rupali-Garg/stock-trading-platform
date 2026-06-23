const authService = require('../services/auth.service');
const jwtConfig   = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: user,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Registration failed',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } =
      await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, jwtConfig.cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { accessToken, user },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Login failed',
    });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const { accessToken } =
      await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (err) {
    console.error('REFRESH ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Token refresh failed',
    });
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.userId);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data:    null,
    });
  } catch (err) {
    console.error('LOGOUT ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Logout failed',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Profile fetched',
      data:    user,
    });
  } catch (err) {
    console.error('PROFILE ERROR:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch profile',
    });
  }
};

module.exports = { register, login, refresh, logout, getProfile };
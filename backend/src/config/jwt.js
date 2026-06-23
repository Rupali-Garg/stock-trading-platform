const jwtConfig = {
  accessTokenSecret:  process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiry:  '15m',
  refreshTokenExpiry: '7d',

  cookieOptions: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  },
};

module.exports = jwtConfig;
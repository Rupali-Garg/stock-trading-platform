// Central JWT configuration
// All token settings in one place

const jwtConfig = {
  accessTokenSecret:  process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiry:  '15m',  // short lived — limits damage if stolen
  refreshTokenExpiry: '7d',   // long lived — stored in httpOnly cookie

  // Cookie options for refresh token
  cookieOptions: {
    httpOnly: true,    // JavaScript cannot read this cookie
                       // Protects against XSS attacks

    secure: process.env.NODE_ENV === 'production',
                       // HTTPS only in production
                       // false in development so localhost works

    sameSite: 'strict',
                       // Cookie only sent to same site
                       // Protects against CSRF attacks

    maxAge: 7 * 24 * 60 * 60 * 1000,
                       // 7 days in milliseconds
                       // matches refreshTokenExpiry
  },
};

// Validate secrets exist on startup
// App crashes immediately if secrets missing
// Better than silent failure later
if (!jwtConfig.accessTokenSecret) {
  console.error('❌ FATAL: JWT_ACCESS_SECRET is not defined in .env');
  process.exit(1);
}

if (!jwtConfig.refreshTokenSecret) {
  console.error('❌ FATAL: JWT_REFRESH_SECRET is not defined in .env');
  process.exit(1);
}

module.exports = jwtConfig;
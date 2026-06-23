// Role Based Access Control
// Usage: router.use(protect, rbac('admin'))
//
// protect runs first → sets req.user
// rbac checks req.user.role

const rbac = (...allowedRoles) => {
  return (req, res, next) => {
    // protect middleware must run before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = rbac;
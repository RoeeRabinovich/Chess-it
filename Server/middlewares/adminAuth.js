const { handleError } = require("../utils/errorHandler");
const { auth } = require("../auth/authService");

// Admin-only middleware (requires authentication + admin role)
const adminAuth = (req, res, next) => {
  // First check authentication
  auth(req, res, () => {
    // Then check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return handleError(res, 403, "Forbidden: Admin access required");
    }
    return next();
  });
};

module.exports = { adminAuth };


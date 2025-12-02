const { verifyAuthToken } = require("./providers/jwt");
const { handleError } = require("../utils/errorHandler");
const config = require("config");
const tokenGenerator = config.get("TOKEN_GENERATOR");

// Authentication middleware (required)
const auth = (req, res, next) => {
  if (tokenGenerator === "jwt") {
    try {
      const tokenFromClient =
        req.headers["x-auth-token"] ||
        req.headers["authorization"]?.replace("Bearer ", "");

      if (!tokenFromClient) {
        return handleError(res, 401, "Unauthorized");
      }

      const userData = verifyAuthToken(tokenFromClient);
      if (!userData) {
        return handleError(
          res,
          401,
          "Authentication Error: unauthorized user."
        );
      }
      req.user = userData;
      return next();
    } catch (error) {
      return handleError(res, 401, error.message);
    }
  }
  return handleError(
    res,
    500,
    "Internal Server Error: Invalid token generator"
  );
};

// Optional authentication middleware
// If token is provided and valid, sets req.user
// If token is missing or invalid, continues without req.user (no error)
const optionalAuth = (req, res, next) => {
  if (tokenGenerator === "jwt") {
    try {
      const tokenFromClient =
        req.headers["x-auth-token"] ||
        req.headers["authorization"]?.replace("Bearer ", "");

      if (tokenFromClient) {
        const userData = verifyAuthToken(tokenFromClient);
        if (userData) {
          req.user = userData;
        }
        // If token is invalid, continue without req.user (don't throw error)
      }
      return next();
    } catch {
      // If token verification fails, continue without req.user

      return next();
    }
  }
  return next();
};

module.exports = { auth, optionalAuth };

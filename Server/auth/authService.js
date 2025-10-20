const { verifyAuthToken } = require("./providers/jwt");
const { handleError } = require("../utils/errorHandler");
const config = require("config");
const tokenGenerator = config.get("TOKEN_GENERATOR");

// Authentication middleware
const auth = (res, req, next) => {
  if (tokenGenerator === "jwt") {
    try {
      let tokenFromClient = req.headers("x-auth-token");

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

module.exports = { auth };

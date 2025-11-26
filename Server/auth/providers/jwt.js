const jwt = require("jsonwebtoken");

const key = process.env.JWT_KEY;

if (!key) {
  throw new Error("JWT_KEY environment variable is not set");
}

// Generate authentication token
const generateAuthToken = (user) => {
  const { _id, isAdmin } = user;
  const token = jwt.sign({ _id, isAdmin }, key, { expiresIn: "1h" }); // Generate token with user data and secret key and expiration time (1 hour)
  return token;
};

// Verify authentication token
// Return user data if token is valid, otherwise throw an error
const verifyAuthToken = (token) => {
  try {
    const userData = jwt.verify(token, key);
    return userData;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Generate password reset token
// Expires in 15 minutes by default
const generateResetToken = (userId, expiresInMinutes = 15) => {
  const payload = {
    userId,
    type: "password-reset",
  };
  return jwt.sign(payload, key, { expiresIn: `${expiresInMinutes}m` });
};

// Verify password reset token
// Return user ID if token is valid, otherwise throw an error
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, key);
    if (decoded.type !== "password-reset") {
      throw new Error("Invalid token type");
    }
    return decoded.userId;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Reset token has expired. Please request a new one.");
    }
    throw new Error("Invalid or expired reset token");
  }
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  generateResetToken,
  verifyResetToken,
};

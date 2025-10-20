const jwt = require("jsonwebtoken");

const key = process.env.JWT_KEY;

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

module.exports = {
  generateAuthToken,
  verifyAuthToken,
};

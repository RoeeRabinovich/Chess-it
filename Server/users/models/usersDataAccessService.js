// Re-export all data access functions from specialized service files
const { registerUser, loginUser } = require("./userAuthService");

const {
  getUserProfile,
  updateUsername,
  updatePuzzleRating,
  findUserByEmail,
  updateUserPassword,
} = require("./userProfileService");

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUsername,
  updatePuzzleRating,
  findUserByEmail,
  updateUserPassword,
};

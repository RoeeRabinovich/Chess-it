const User = require("./mongodb/User");
const config = require("config");
const _ = require("lodash");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

// Get user profile
const getUserProfile = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findById(userId);

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "createdAt",
        "puzzleRating",
      ]);
      return Promise.resolve(userData);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "getUserProfile function is not supported for this database"
  );
};

// Update username
const updateUsername = async (userId, newUsername) => {
  if (DB === "MONGODB") {
    try {
      // Check if username already exists
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new Error("Username already exists");
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { username: newUsername },
        { new: true, runValidators: true }
      );

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "createdAt",
        "puzzleRating",
      ]);
      return Promise.resolve(userData);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "updateUsername function is not supported for this database"
  );
};

// Update user puzzle rating
const updatePuzzleRating = async (userId, newRating) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { puzzleRating: newRating },
        { new: true, runValidators: true }
      );

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "createdAt",
        "puzzleRating",
      ]);
      return Promise.resolve(userData);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "updatePuzzleRating function is not supported for this database"
  );
};

// Find user by email (for password reset)
const findUserByEmail = async (email) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return Promise.resolve(user);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "findUserByEmail function is not supported for this database"
  );
};

// Update user password
const updateUserPassword = async (userId, hashedPassword) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true, runValidators: true }
      );

      if (!user) throw new Error("User not found");

      return Promise.resolve(true);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "updateUserPassword function is not supported for this database"
  );
};

module.exports = {
  getUserProfile,
  updateUsername,
  updatePuzzleRating,
  findUserByEmail,
  updateUserPassword,
};


const User = require("./mongodb/User");
const config = require("config");
const _ = require("lodash");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

// Get all users with pagination and search
const getAllUsers = async (page = 1, pageSize = 10, searchQuery = "") => {
  if (DB === "MONGODB") {
    try {
      const skip = (page - 1) * pageSize;
      const limit = parseInt(pageSize);

      // Build search query
      const searchFilter = searchQuery
        ? {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } },
              { email: { $regex: searchQuery, $options: "i" } },
            ],
          }
        : {};

      // Get total count
      const totalUsers = await User.countDocuments(searchFilter);

      // Get users with pagination
      const users = await User.find(searchFilter)
        .select("-password") // Exclude password
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean();

      // Format users
      const formattedUsers = users.map((user) => {
        const userData = _.pick(user, [
          "_id",
          "username",
          "email",
          "isAdmin",
          "createdAt",
          "puzzleRating",
          "studiesCreated",
        ]);
        return {
          ...userData,
          _id: userData._id.toString(),
          role: userData.isAdmin ? "admin" : "user",
          createdAt: userData.createdAt.toISOString(),
        };
      });

      return Promise.resolve({
        users: formattedUsers,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        pageSize: limit,
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "getAllUsers function is not supported for this database"
  );
};

// Get user by ID (admin)
const getUserById = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findById(userId).select("-password").lean();

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "isAdmin",
        "createdAt",
        "puzzleRating",
        "studiesCreated",
      ]);

      return Promise.resolve({
        ...userData,
        _id: userData._id.toString(),
        role: userData.isAdmin ? "admin" : "user",
        createdAt: userData.createdAt.toISOString(),
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "getUserById function is not supported for this database"
  );
};

// Update user role (admin)
const updateUserRole = async (userId, isAdmin) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isAdmin: Boolean(isAdmin) },
        { new: true, runValidators: true }
      )
        .select("-password")
        .lean();

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "isAdmin",
        "createdAt",
        "puzzleRating",
        "studiesCreated",
      ]);

      return Promise.resolve({
        ...userData,
        _id: userData._id.toString(),
        role: userData.isAdmin ? "admin" : "user",
        createdAt: userData.createdAt.toISOString(),
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "updateUserRole function is not supported for this database"
  );
};

// Update username (admin can update any user)
const adminUpdateUsername = async (userId, newUsername) => {
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
      )
        .select("-password")
        .lean();

      if (!user) throw new Error("User not found");

      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "isAdmin",
        "createdAt",
        "puzzleRating",
        "studiesCreated",
      ]);

      return Promise.resolve({
        ...userData,
        _id: userData._id.toString(),
        role: userData.isAdmin ? "admin" : "user",
        createdAt: userData.createdAt.toISOString(),
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "adminUpdateUsername function is not supported for this database"
  );
};

// Delete user (admin)
const deleteUser = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      // Prevent deleting admin users
      if (user.isAdmin) {
        throw new Error("Cannot delete admin users");
      }

      await User.findByIdAndDelete(userId);
      return Promise.resolve({ message: "User deleted successfully" });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "deleteUser function is not supported for this database"
  );
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  adminUpdateUsername,
  deleteUser,
};

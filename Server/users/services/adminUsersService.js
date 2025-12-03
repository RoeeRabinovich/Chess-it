const {
  getAllUsers,
  getUserById,
  updateUserRole,
  adminUpdateUsername,
  deleteUser,
} = require("../models/adminUsersDataAccess");
const { validateUpdateUsername } = require("../validations/userValidatorService");
const { handleJoiError } = require("../../utils/errorHandler");
const { generateResetToken } = require("../../auth/providers/jwt");
const { sendPasswordResetEmail } = require("../../services/emailService");
const config = require("config");

// Get all users with pagination and search
const getAllUsersService = async (page, pageSize, searchQuery) => {
  try {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const search = searchQuery || "";

    if (pageNum < 1) {
      return Promise.reject({
        status: 400,
        message: "Page must be greater than 0",
      });
    }

    if (size < 1 || size > 100) {
      return Promise.reject({
        status: 400,
        message: "Page size must be between 1 and 100",
      });
    }

    const result = await getAllUsers(pageNum, size, search);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get user by ID
const getUserByIdService = async (userId) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    const user = await getUserById(userId);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update user role
const updateUserRoleService = async (userId, isAdmin) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    if (typeof isAdmin !== "boolean") {
      return Promise.reject({
        status: 400,
        message: "isAdmin must be a boolean",
      });
    }

    const user = await updateUserRole(userId, isAdmin);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Admin update username
const adminUpdateUsernameService = async (userId, newUsername) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    if (!newUsername || typeof newUsername !== "string") {
      return Promise.reject({
        status: 400,
        message: "Username is required",
      });
    }

    // Validate username
    const { error } = validateUpdateUsername({ username: newUsername });
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    const user = await adminUpdateUsername(userId, newUsername);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Admin-initiated password reset
const adminResetPasswordService = async (userId, frontendUrl) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return Promise.reject({
        status: 404,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(
      userId,
      config.get("EMAIL.RESET_PASSWORD_EXPIRY_MINUTES") || 15
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, frontendUrl);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return Promise.reject({
        status: 500,
        message: "Failed to send password reset email",
      });
    }

    return Promise.resolve({
      message: "Password reset email has been sent successfully.",
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete user
const deleteUserService = async (userId) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    const result = await deleteUser(userId);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  adminUpdateUsernameService,
  adminResetPasswordService,
  deleteUserService,
};


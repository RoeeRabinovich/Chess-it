const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUsername,
  updatePuzzleRating,
  findUserByEmail,
  updateUserPassword,
} = require("../models/usersDataAccessService");
const normalizeUser = require("../helpers/normalizeUser");
const {
  validateRegister,
  validateLogin,
  validateUpdateUsername,
  validateForgotPassword,
  validateResetPassword,
} = require("../validations/userValidatorService");
const { hashUserPassword } = require("../helpers/bcrypt");
const { handleJoiError } = require("../../utils/errorHandler");
const { generateResetToken } = require("../../auth/providers/jwt");
const { sendPasswordResetEmail } = require("../../services/emailService");
const { verifyResetToken } = require("../../auth/providers/jwt");
const config = require("config");

//Service functions - performs the main logic of the application.

//Register user
const registerUserService = async (rawUser) => {
  try {
    const { error } = validateRegister(rawUser);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    let user = normalizeUser(rawUser);
    user.password = await hashUserPassword(user.password);
    user = await registerUser(user);

    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Login user
const loginUserService = async (rawUser) => {
  try {
    const { error } = validateLogin(rawUser);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    let user = { ...rawUser };
    user = await loginUser(user);

    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Get user profile
const getUserProfileService = async (userId) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    const user = await getUserProfile(userId);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Update username
const updateUsernameService = async (userId, newUsername) => {
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

    const user = await updateUsername(userId, newUsername);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Update user puzzle rating
const updatePuzzleRatingService = async (userId, newRating) => {
  try {
    if (!userId) {
      return Promise.reject({
        status: 400,
        message: "User ID is required",
      });
    }

    if (typeof newRating !== "number" || newRating < 0) {
      return Promise.reject({
        status: 400,
        message: "Invalid rating value",
      });
    }

    const user = await updatePuzzleRating(userId, newRating);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

//Request password reset (forgot password)
const forgotPasswordService = async (email, frontendUrl) => {
  try {
    // Validate email
    const { error } = validateForgotPassword({ email });
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    // Find user by email (don't reveal if user exists for security)
    const user = await findUserByEmail(email);

    // Always return success message (security best practice - don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate reset token (15 minutes expiry)
      const resetToken = generateResetToken(
        user._id.toString(),
        config.get("EMAIL.RESET_PASSWORD_EXPIRY_MINUTES") || 15
      );

      // Send password reset email
      try {
        await sendPasswordResetEmail(email, resetToken, frontendUrl);
      } catch (emailError) {
        // Log error but don't reveal to user
        console.error("Failed to send password reset email:", emailError);
        // Still return success to prevent email enumeration
      }
    }

    // Always return success (security: don't reveal if email exists)
    return Promise.resolve({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

//Reset password with token
const resetPasswordService = async (token, newPassword) => {
  try {
    // Validate token and get user ID
    let userId;
    try {
      userId = verifyResetToken(token);
    } catch (tokenError) {
      return Promise.reject({
        status: 400,
        message: tokenError.message || "Invalid or expired reset token",
      });
    }

    // Validate password
    const { error } = validateResetPassword({
      token,
      password: newPassword,
      confirmPassword: newPassword, // For validation, we'll check separately
    });

    if (error) {
      // Extract password-specific errors
      const passwordErrors = error.details.filter(
        (detail) => detail.path[0] === "password"
      );
      if (passwordErrors.length > 0) {
        return Promise.reject(await handleJoiError(error));
      }
    }

    // Hash new password
    const hashedPassword = await hashUserPassword(newPassword);

    // Update user password
    await updateUserPassword(userId, hashedPassword);

    return Promise.resolve({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUsernameService,
  updatePuzzleRatingService,
  forgotPasswordService,
  resetPasswordService,
};

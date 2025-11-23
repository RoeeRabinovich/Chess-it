const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUsername,
  updatePuzzleRating,
} = require("../models/usersDataAccessService");
const normalizeUser = require("../helpers/normalizeUser");
const {
  validateRegister,
  validateLogin,
  validateUpdateUsername,
} = require("../validations/userValidatorService");
const { hashUserPassword } = require("../helpers/bcrypt");
const { handleJoiError } = require("../../utils/errorHandler");

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

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUsernameService,
  updatePuzzleRatingService,
};

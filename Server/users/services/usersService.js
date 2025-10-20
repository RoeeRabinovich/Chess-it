const { registerUser, loginUser } = require("../models/usersDataAccessService");
const normalizeUser = require("../helpers/normalizeUser");
const { validateRegister } = require("../validations/userValidatorService");
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

module.exports = { registerUserService, loginUserService };

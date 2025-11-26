const registerValidator = require("./joi/registerValidator");
const loginValidator = require("./joi/loginValidator");
const updateUsernameValidator = require("./joi/updateUsernameValidator");
const forgotPasswordValidator = require("./joi/forgotPasswordValidator");
const resetPasswordValidator = require("./joi/resetPasswordValidator");
const config = require("config");

const validator = config.get("VALIDATOR");

const validateRegister = (user) => {
  if (validator === "joi") {
    return registerValidator(user);
  }
};

const validateLogin = (user) => {
  if (validator === "joi") {
    return loginValidator(user);
  }
};

const validateUpdateUsername = (data) => {
  if (validator === "joi") {
    return updateUsernameValidator(data);
  }
};

const validateForgotPassword = (data) => {
  if (validator === "joi") {
    return forgotPasswordValidator(data);
  }
};

const validateResetPassword = (data) => {
  if (validator === "joi") {
    return resetPasswordValidator(data);
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUsername,
  validateForgotPassword,
  validateResetPassword,
};

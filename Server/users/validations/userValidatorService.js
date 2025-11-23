const registerValidator = require("./joi/registerValidator");
const loginValidator = require("./joi/loginValidator");
const updateUsernameValidator = require("./joi/updateUsernameValidator");
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
module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUsername,
};

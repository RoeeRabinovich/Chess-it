const registerValidator = require("./joi/registerValidator");
const loginValidator = require("./joi/loginValidator");
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
module.exports = { validateRegister, validateLogin };

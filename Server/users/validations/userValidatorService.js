const registerValidator = require("./registerValidator");
const config = require("config");

const validator = config.get("VALIDATOR");

const validateRegister = (user) => {
  if (validator === "joi") {
    return registerValidator(user);
  }
};

module.exports = { validateRegister };

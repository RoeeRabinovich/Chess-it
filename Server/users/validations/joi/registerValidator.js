const joi = require("joi");

const registerValidator = (user) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?]).{8,}$/;

  const schema = joi.object({
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(passwordRegex).required().messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one special character",
    }),
  });

  return schema.validate(user);
};

module.exports = registerValidator;

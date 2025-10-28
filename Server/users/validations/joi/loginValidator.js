const Joi = require("joi");

const loginValidator = (user) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?]).{8,}$/;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .ruleset.regex(passwordRegex)
      .rule({
        message:
          "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one special character",
      })
      .required(),
  });
  return schema.validate(user);
};

module.exports = loginValidator;

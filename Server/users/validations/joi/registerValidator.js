const Joi = require("joi");

const registerValidator = (user) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){4})(?=.*[*_\-+&%^$#@!]).{8,}$/;

  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(passwordRegex).required().messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, at least 4 numbers, and one special character (*_-+&%^$#@!)",
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    messages: {
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your password.",
    },
  });

  return schema.validate(user);
};

module.exports = registerValidator;

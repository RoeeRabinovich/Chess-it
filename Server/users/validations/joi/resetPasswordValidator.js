const Joi = require("joi");

const resetPasswordValidator = (data) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){4})(?=.*[*_\-+&%^$#@!]).{8,}$/;

  const schema = Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Reset token is required.",
      "any.required": "Reset token is required.",
    }),
    password: Joi.string().pattern(passwordRegex).required().messages({
      "string.empty": "Password is required.",
      "string.pattern.base":
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, at least 4 numbers, and one special character (*_-+&%^$#@!)",
      "any.required": "Password is required.",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match.",
        "any.required": "Please confirm your password.",
      }),
  });

  return schema.validate(data);
};

module.exports = resetPasswordValidator;


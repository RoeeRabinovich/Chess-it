const Joi = require("joi");

const forgotPasswordValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
    }),
  });

  return schema.validate(data);
};

module.exports = forgotPasswordValidator;


const Joi = require("joi");

const updateUsernameValidator = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 3 characters.",
      "string.max": "Username must be at most 30 characters.",
    }),
  });

  return schema.validate(data);
};

module.exports = updateUsernameValidator;


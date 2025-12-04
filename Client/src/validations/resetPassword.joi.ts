import Joi from "joi";

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .ruleset.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){4})(?=.*[*_\-+&%^$#@!]).{8,}$/,
    )
    .rule({
      message:
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, at least 4 numbers, and one special character (*_-+&%^$#@!)",
    })
    .required()
    .messages({
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),

  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Please confirm your password.",
  }),
});


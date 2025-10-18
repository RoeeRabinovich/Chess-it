import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address.",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

// Alternative stricter schema (uncomment if you want more validation):
// export const loginSchema = Joi.object({
//   email: Joi.string()
//     .pattern(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/)
//     .rule({ message: 'Email must be a valid email address' })
//     .required(),

//   password: Joi.string()
//     .regex(
//       /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{8,20})/
//     )
//     .rule({
//       message:
//         'Password must be 8-20 characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-',
//     })
//     .required(),
// });

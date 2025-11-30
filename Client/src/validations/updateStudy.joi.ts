import Joi from "joi";

export const updateStudySchema = Joi.object({
  studyName: Joi.string().min(8).max(52).required().messages({
    "string.empty": "Study name is required.",
    "string.min": "Study name must be at least 8 characters.",
    "string.max": "Study name must be at most 52 characters.",
  }),

  description: Joi.string().allow("").optional(),

  isPublic: Joi.boolean().required().messages({
    "any.required": "Please select visibility (Public or Private).",
  }),
});

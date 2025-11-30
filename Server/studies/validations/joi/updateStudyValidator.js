const Joi = require("joi");

const updateStudyValidator = (study) => {
  const schema = Joi.object({
    studyName: Joi.string().min(8).max(52).trim().required().messages({
      "string.empty": "Study name is required.",
      "string.min": "Study name must be at least 8 characters.",
      "string.max": "Study name must be at most 52 characters.",
      "any.required": "Study name is required.",
    }),
    description: Joi.string().allow("").trim().optional(),
    isPublic: Joi.boolean().required().messages({
      "any.required": "Visibility is required.",
    }),
    // Note: category and gameState are not allowed to be updated via this endpoint
  });
  return schema.validate(study, { abortEarly: false });
};

module.exports = updateStudyValidator;

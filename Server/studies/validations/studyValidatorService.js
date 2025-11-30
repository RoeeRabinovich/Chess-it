const createStudyValidator = require("./joi/createStudyValidator");
const updateStudyValidator = require("./joi/updateStudyValidator");
const config = require("config");

const validator = config.get("VALIDATOR");

const validateCreateStudy = (study) => {
  if (validator === "joi") {
    return createStudyValidator(study);
  }
};

const validateUpdateStudy = (study) => {
  if (validator === "joi") {
    return updateStudyValidator(study);
  }
};

module.exports = { validateCreateStudy, validateUpdateStudy };

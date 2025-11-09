const createStudyValidator = require("./joi/createStudyValidator");
const config = require("config");

const validator = config.get("VALIDATOR");

const validateCreateStudy = (study) => {
  if (validator === "joi") {
    return createStudyValidator(study);
  }
};

module.exports = { validateCreateStudy };

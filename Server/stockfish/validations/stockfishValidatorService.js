const config = require("config");
const { analyzeSchema } = require("./joi/analyzeValidator");

const validator = config.get("VALIDATOR");

const validateAnalyzeRequest = (requestData) => {
  if (validator === "joi") {
    const { error, value } = analyzeSchema.validate(requestData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }
};

module.exports = { validateAnalyzeRequest };

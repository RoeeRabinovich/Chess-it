const Joi = require("joi");
const { Chess } = require("chess.js");

// Custom FEN validator using chess.js
const fenValidator = (value, helpers) => {
  try {
    const chess = new Chess();
    chess.load(value);
    return value;
  } catch {
    return helpers.error("any.invalid", { message: "Invalid FEN string" });
  }
};

// Joi schema for analyze request
const analyzeSchema = Joi.object({
  fen: Joi.string().custom(fenValidator).required(),
  depth: Joi.number().integer().min(1).max(24).default(15),
  multipv: Joi.number().integer().min(1).max(5).default(1),
  analysisMode: Joi.string().valid("quick", "deep").default("quick"),
});

module.exports = { analyzeSchema };

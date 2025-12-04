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

// Schema for a single chess move
const chessMoveSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  promotion: Joi.string().optional(),
  san: Joi.string().required(),
  lan: Joi.string().required(),
  before: Joi.string().required(),
  after: Joi.string().required(),
  captured: Joi.string().optional(),
  flags: Joi.string().required(),
  piece: Joi.string().required(),
  color: Joi.string().valid("w", "b").required(),
});

// Schema for MoveNode (recursive tree structure)
// Since Mongoose uses Mixed type for branches, we validate top-level structure only
// Deep recursive validation happens in application code if needed
const branchSequenceSchema = Joi.array()
  .items(Joi.object().unknown(true)) // Allow nested MoveNode objects
  .max(100); // Limit branch sequence length

const branchesSchema = Joi.array().items(branchSequenceSchema).max(50); // Limit number of branches per node

const moveNodeSchema = Joi.object({
  move: chessMoveSchema.required(),
  branches: branchesSchema.required(),
});

// Schema for MovePath (array of numbers)
const movePathSchema = Joi.array()
  .items(Joi.number().integer().min(0))
  .max(20) // Limit path depth
  .required();

// Schema for opening information
const openingSchema = Joi.object({
  name: Joi.string().required(),
  eco: Joi.string().required(),
});

// Schema for gameState
const gameStateSchema = Joi.object({
  position: Joi.string().custom(fenValidator).required(),
  moveTree: Joi.array().items(moveNodeSchema).required(),
  rootBranches: branchesSchema.default([]),
  currentPath: movePathSchema.required(),
  isFlipped: Joi.boolean().required(),
  opening: openingSchema.optional(),
  comments: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

const createStudyValidator = (study) => {
  const schema = Joi.object({
    studyName: Joi.string().min(8).max(52).trim().required().messages({
      "string.empty": "Study name is required.",
      "string.min": "Study name must be at least 8 characters.",
      "string.max": "Study name must be at most 52 characters.",
      "any.required": "Study name is required.",
    }),
    category: Joi.string()
      .valid("Opening", "Endgame", "Strategy", "Tactics")
      .required()
      .messages({
        "any.only": "Please select a valid category.",
        "any.required": "Category is required.",
      }),
    description: Joi.string().allow("").trim().optional(),
    isPublic: Joi.boolean().required().messages({
      "any.required": "Visibility is required.",
    }),
    gameState: gameStateSchema
      .required()
      .custom((value, helpers) => {
        // Ensure the study has at least one move in the tree
        if (!value.moveTree || value.moveTree.length === 0) {
          return helpers.error("any.custom", {
            message: "Study must contain at least one move.",
          });
        }
        return value;
      })
      .messages({
        "any.required": "Game state is required.",
        "any.custom": "Study must contain at least one move.",
      }),
    // Note: createdBy should NOT be in the request body - it comes from JWT token
  });
  return schema.validate(study, { abortEarly: false });
};

module.exports = createStudyValidator;

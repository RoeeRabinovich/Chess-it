const mongoose = require("mongoose");

// Schema for a single chess move
const chessMoveSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    promotion: String,
    san: { type: String, required: true },
    lan: { type: String, required: true },
    before: { type: String, required: true },
    after: { type: String, required: true },
    captured: String,
    flags: { type: String, required: true },
    piece: { type: String, required: true },
    color: { type: String, required: true, enum: ["w", "b"] },
  },
  { _id: false }
);

// Schema for MoveNode (recursive tree structure)
// Note: Mongoose doesn't support recursive schemas directly, so we use Mixed type
// Structure validation is handled in Joi validation layer
const moveNodeSchemaDefinition = {
  move: chessMoveSchema,
  branches: {
    type: [[mongoose.Schema.Types.Mixed]], // Array of branch sequences, each sequence is an array of MoveNodes
    default: [],
  },
};

const moveNodeSchema = new mongoose.Schema(moveNodeSchemaDefinition, {
  _id: false,
});

// Schema for opening information
const openingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eco: { type: String, required: true },
  },
  { _id: false }
);

// Main study schema
const studySchema = new mongoose.Schema(
  {
    studyName: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 52,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Opening", "Endgame", "Strategy", "Tactics"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    gameState: {
      position: {
        type: String,
        required: true,
        default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      },
      moveTree: {
        type: [moveNodeSchema],
        default: [],
      },
      rootBranches: {
        type: [[mongoose.Schema.Types.Mixed]],
        default: [],
      },
      currentPath: {
        type: [Number], // Array of numbers: [mainIndex, branchIndex?, moveIndex?, ...]
        default: [],
      },
      isFlipped: {
        type: Boolean,
        default: false,
      },
      opening: openingSchema,
      comments: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
studySchema.index({ createdBy: 1 });
studySchema.index({ category: 1 });
studySchema.index({ isPublic: 1 });
studySchema.index({ createdAt: -1 });
studySchema.index({ likes: -1 });

const Study = mongoose.model("Study", studySchema);

module.exports = Study;

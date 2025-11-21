const mongoose = require("mongoose");

// Schema for tracking user likes on studies
const studyLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    study: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Study",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only like a study once
studyLikeSchema.index({ user: 1, study: 1 }, { unique: true });

// Index for faster queries
studyLikeSchema.index({ user: 1 });
studyLikeSchema.index({ study: 1 });

const StudyLike = mongoose.model("StudyLike", studyLikeSchema);

module.exports = StudyLike;


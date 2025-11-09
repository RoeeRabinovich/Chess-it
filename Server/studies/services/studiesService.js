const { createStudy } = require("../models/studiesDataAccessService");
const { validateCreateStudy } = require("../validations/studyValidatorService");
const { handleJoiError } = require("../../utils/errorHandler");

// Service functions - performs the main logic of the application.

// Create new study
const createStudyService = async (userId, rawStudy) => {
  try {
    // Validate the study data
    const { error } = validateCreateStudy(rawStudy);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    // Prepare normalized study data
    const normalizedStudy = {
      studyName: rawStudy.studyName.trim(),
      category: rawStudy.category,
      description: rawStudy.description?.trim() || "",
      isPublic: rawStudy.isPublic,
      gameState: {
        position: rawStudy.gameState.position,
        moves: rawStudy.gameState.moves,
        branches: rawStudy.gameState.branches,
        currentMoveIndex: rawStudy.gameState.currentMoveIndex,
        isFlipped: rawStudy.gameState.isFlipped,
        opening: rawStudy.gameState.opening,
        comments: rawStudy.gameState.comments || {},
      },
      createdBy: userId,
    };

    // Save to database
    const result = await createStudy(normalizedStudy);

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { createStudyService };

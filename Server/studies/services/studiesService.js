const {
  createStudy,
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
} = require("../models/studiesDataAccessService");
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

// Get study by ID
// Returns study if it's public or if the user is the creator
const getStudyByIdService = async (studyId, userId) => {
  try {
    const study = await findStudyById(studyId);

    // Check if study exists
    if (!study) {
      const error = new Error("Study not found");
      error.status = 404;
      return Promise.reject(error);
    }

    // Check access: user can view if study is public OR if they created it
    const studyCreatorId = study.createdBy._id
      ? study.createdBy._id.toString()
      : study.createdBy.toString();
    const isOwner = userId && studyCreatorId === userId.toString();

    if (!study.isPublic && !isOwner) {
      const error = new Error("Access denied. This study is private.");
      error.status = 403;
      return Promise.reject(error);
    }

    return Promise.resolve(study);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get all studies by user
const getUserStudiesService = async (userId) => {
  try {
    const studies = await findStudiesByUser(userId);
    return Promise.resolve(studies);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get public studies with filters
const getPublicStudiesService = async (queryParams) => {
  try {
    const { category, filter, search, limit, skip } = queryParams;
    const studies = await findPublicStudies({
      category,
      filter,
      search,
      limit: limit ? parseInt(limit) : 20,
      skip: skip ? parseInt(skip) : 0,
    });
    return Promise.resolve(studies);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  createStudyService,
  getStudyByIdService,
  getUserStudiesService,
  getPublicStudiesService,
};

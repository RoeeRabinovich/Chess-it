const {
  createStudy,
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
  likeStudy,
  unlikeStudy,
  getUserLikedStudyIds,
  updateStudy,
  deleteStudy,
} = require("../models/studiesDataAccessService");
const {
  validateCreateStudy,
  validateUpdateStudy,
} = require("../validations/studyValidatorService");
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
        moveTree: rawStudy.gameState.moveTree,
        rootBranches: rawStudy.gameState.rootBranches || [],
        currentPath: rawStudy.gameState.currentPath,
        isFlipped: rawStudy.gameState.isFlipped,
        opening: rawStudy.gameState.opening,
        comments: rawStudy.gameState.comments || {},
      },
      createdBy: userId,
    };

    // Save to database
    const result = await createStudy(normalizedStudy);

    // Increment user's studiesCreated count
    const User = require("../../users/models/mongodb/User");
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { studiesCreated: 1 },
      });
    } catch (userUpdateError) {
      // Log error but don't fail study creation
      console.error(
        `Failed to increment studiesCreated for user ${userId}:`,
        userUpdateError
      );
      // Continue - study creation was successful
    }

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
    const { category, filter, search, limit, skip, userId, likedOnly } =
      queryParams;
    const studies = await findPublicStudies({
      category,
      filter,
      search,
      limit: limit ? parseInt(limit) : 20,
      skip: skip ? parseInt(skip) : 0,
      userId: userId || null,
      likedOnly: likedOnly === true || likedOnly === "true",
    });
    return Promise.resolve(studies);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Like a study
const likeStudyService = async (userId, studyId) => {
  try {
    const result = await likeStudy(userId, studyId);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Unlike a study
const unlikeStudyService = async (userId, studyId) => {
  try {
    const result = await unlikeStudy(userId, studyId);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get user's liked study IDs
const getUserLikedStudyIdsService = async (userId) => {
  try {
    const studyIds = await getUserLikedStudyIds(userId);
    return Promise.resolve(studyIds);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update a study
const updateStudyService = async (userId, studyId, rawStudy) => {
  try {
    // Validate the study data
    const { error } = validateUpdateStudy(rawStudy);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    // Prepare normalized study data
    const normalizedStudy = {
      studyName: rawStudy.studyName.trim(),
      description: rawStudy.description?.trim() || "",
      isPublic: rawStudy.isPublic,
    };

    // Update in database
    const result = await updateStudy(userId, studyId, normalizedStudy);

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete a study
const deleteStudyService = async (userId, studyId) => {
  try {
    const result = await deleteStudy(userId, studyId);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  createStudyService,
  getStudyByIdService,
  getUserStudiesService,
  getPublicStudiesService,
  likeStudyService,
  unlikeStudyService,
  getUserLikedStudyIdsService,
  updateStudyService,
  deleteStudyService,
};

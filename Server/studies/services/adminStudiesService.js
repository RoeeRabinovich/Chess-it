const {
  getAllStudies,
  adminUpdateStudyMetadata,
  adminDeleteStudy,
} = require("../models/adminStudiesDataAccess");
const { validateUpdateStudy } = require("../validations/studyValidatorService");
const { handleJoiError } = require("../../utils/errorHandler");

// Get all studies with pagination, search, and filters
const getAllStudiesService = async (
  page,
  pageSize,
  searchQuery,
  category,
  isPublic,
  sortBy,
  sortOrder,
  dateFilter
) => {
  try {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const search = searchQuery || "";
    const cat = category || "All";
    const visibility = isPublic || "All";
    const sortField = sortBy || "createdAt";
    const sortDir = sortOrder || "desc";
    const date = dateFilter || "All";

    if (pageNum < 1) {
      return Promise.reject({
        status: 400,
        message: "Page must be greater than 0",
      });
    }

    if (size < 1 || size > 100) {
      return Promise.reject({
        status: 400,
        message: "Page size must be between 1 and 100",
      });
    }

    const result = await getAllStudies(
      pageNum,
      size,
      search,
      cat,
      visibility,
      sortField,
      sortDir,
      date
    );
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Admin update study metadata
const adminUpdateStudyMetadataService = async (studyId, updateData) => {
  try {
    if (!studyId) {
      return Promise.reject({
        status: 400,
        message: "Study ID is required",
      });
    }

    // Validate the study data (include isPublic for Joi validation and DB update)
    const validationData = {
      studyName: updateData.studyName,
      description: updateData.description,
      isPublic: updateData.isPublic, // Required by Joi validator and will be updated in DB
    };

    const { error } = validateUpdateStudy(validationData);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    // Also validate category if provided
    if (updateData.category) {
      const validCategories = ["Opening", "Endgame", "Strategy", "Tactics"];
      if (!validCategories.includes(updateData.category)) {
        return Promise.reject({
          status: 400,
          message: "Invalid category",
        });
      }
    }

    const study = await adminUpdateStudyMetadata(studyId, updateData);
    return Promise.resolve(study);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Admin delete study
const adminDeleteStudyService = async (studyId) => {
  try {
    if (!studyId) {
      return Promise.reject({
        status: 400,
        message: "Study ID is required",
      });
    }

    const result = await adminDeleteStudy(studyId);
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  getAllStudiesService,
  adminUpdateStudyMetadataService,
  adminDeleteStudyService,
};

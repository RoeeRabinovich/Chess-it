const Study = require("./mongodb/Study");
const config = require("config");
const _ = require("lodash");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

// Data access functions - sends data from and to the database after validation and normalization.

// Create new study
const createStudy = async (normalizedStudy) => {
  if (DB === "MONGODB") {
    try {
      const study = new Study(normalizedStudy);
      const savedStudy = await study.save();

      // Return only essential fields
      return Promise.resolve({
        id: savedStudy._id.toString(),
        studyName: savedStudy.studyName,
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "createStudy function is not supported for this database"
  );
};

// Find study by ID
const findStudyById = async (studyId) => {
  if (DB === "MONGODB") {
    try {
      const study = await Study.findById(studyId).populate(
        "createdBy",
        "username email"
      );
      if (!study) throw new Error("Study not found");

      return Promise.resolve(study);
    } catch (error) {
      error.status = 404;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "findStudyById function is not supported for this database"
  );
};

// Find studies by user
const findStudiesByUser = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const studies = await Study.find({ createdBy: userId })
        .select("studyName category description isPublic createdAt updatedAt")
        .sort({ createdAt: -1 });

      return Promise.resolve(studies);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "findStudiesByUser function is not supported for this database"
  );
};

// Find public studies
const findPublicStudies = async (limit = 20, skip = 0) => {
  if (DB === "MONGODB") {
    try {
      const studies = await Study.find({ isPublic: true })
        .populate("createdBy", "username")
        .select("studyName category description createdAt createdBy")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      return Promise.resolve(studies);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "findPublicStudies function is not supported for this database"
  );
};

module.exports = {
  createStudy,
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
};

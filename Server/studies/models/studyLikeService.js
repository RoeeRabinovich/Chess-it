const Study = require("./mongodb/Study");
const StudyLike = require("./mongodb/StudyLike");
const config = require("config");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

// Like a study
const likeStudy = async (userId, studyId) => {
  if (DB === "MONGODB") {
    try {
      // Check if study exists
      const study = await Study.findById(studyId);
      if (!study) {
        const error = new Error("Study not found");
        error.status = 404;
        throw error;
      }

      // Check if already liked
      const existingLike = await StudyLike.findOne({
        user: userId,
        study: studyId,
      });
      if (existingLike) {
        const error = new Error("Study already liked");
        error.status = 400;
        throw error;
      }

      // Create like
      const studyLike = new StudyLike({ user: userId, study: studyId });
      await studyLike.save();

      // Increment likes count on study
      study.likes = (study.likes || 0) + 1;
      await study.save();

      return Promise.resolve({ success: true });
    } catch (error) {
      if (error.status) {
        return Promise.reject(error);
      }
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "likeStudy function is not supported for this database"
  );
};

// Unlike a study
const unlikeStudy = async (userId, studyId) => {
  if (DB === "MONGODB") {
    try {
      // Check if like exists
      const studyLike = await StudyLike.findOne({
        user: userId,
        study: studyId,
      });
      if (!studyLike) {
        const error = new Error("Study not liked");
        error.status = 404;
        throw error;
      }

      // Remove like
      await StudyLike.deleteOne({ _id: studyLike._id });

      // Decrement likes count on study
      const study = await Study.findById(studyId);
      if (study) {
        study.likes = Math.max(0, (study.likes || 0) - 1);
        await study.save();
      }

      return Promise.resolve({ success: true });
    } catch (error) {
      if (error.status) {
        return Promise.reject(error);
      }
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "unlikeStudy function is not supported for this database"
  );
};

// Get user's liked study IDs
const getUserLikedStudyIds = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const likes = await StudyLike.find({ user: userId }).select("study");
      return Promise.resolve(likes.map((like) => like.study.toString()));
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "getUserLikedStudyIds function is not supported for this database"
  );
};

module.exports = {
  likeStudy,
  unlikeStudy,
  getUserLikedStudyIds,
};


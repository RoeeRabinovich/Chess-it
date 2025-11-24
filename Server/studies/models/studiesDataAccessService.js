const Study = require("./mongodb/Study");
const StudyLike = require("./mongodb/StudyLike");
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
        .populate("createdBy", "username")
        .select("studyName category description isPublic createdAt updatedAt likes gameState.position")
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

// Find public studies with filters
const findPublicStudies = async ({
  category,
  filter,
  search,
  limit = 20,
  skip = 0,
  userId = null,
  likedOnly = false,
} = {}) => {
  if (DB === "MONGODB") {
    try {
      // Build query
      const query = { isPublic: true };
      if (category && category !== "All") {
        query.category = category;
      }

      // Add search query - search in studyName and description
      if (search && search.trim()) {
        query.$or = [
          { studyName: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      // If filtering by liked studies, get list of liked study IDs
      if (likedOnly && userId) {
        const likedStudies = await StudyLike.find({ user: userId }).select(
          "study"
        );
        const likedStudyIds = likedStudies.map((like) => like.study);
        if (likedStudyIds.length === 0) {
          // User has no liked studies, return empty array
          return Promise.resolve([]);
        }
        query._id = { $in: likedStudyIds };
      }

      // Build sort
      let sort = {};
      if (filter === "Popular") {
        sort = { likes: -1, createdAt: -1 }; // Sort by likes desc, then by date
      } else {
        // "New" or default: sort by date
        sort = { createdAt: -1 };
      }

      const studies = await Study.find(query)
        .populate("createdBy", "username")
        .select(
          "studyName category description createdAt createdBy likes gameState.position"
        )
        .sort(sort)
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
  createStudy,
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
  likeStudy,
  unlikeStudy,
  getUserLikedStudyIds,
};

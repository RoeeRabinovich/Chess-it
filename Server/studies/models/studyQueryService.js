const Study = require("./mongodb/Study");
const StudyLike = require("./mongodb/StudyLike");
const config = require("config");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

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
        .select(
          "studyName category description isPublic createdAt updatedAt likes gameState.position"
        )
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

module.exports = {
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
};

const Study = require("./mongodb/Study");
const StudyLike = require("./mongodb/StudyLike");
const config = require("config");
const _ = require("lodash");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

// Get all studies with pagination, search, and filters (admin only)
const getAllStudies = async (
  page = 1,
  pageSize = 10,
  searchQuery = "",
  category = null,
  isPublic = null,
  sortBy = "createdAt",
  sortOrder = "desc",
  dateFilter = "All"
) => {
  if (DB === "MONGODB") {
    try {
      const skip = (page - 1) * pageSize;
      const limit = parseInt(pageSize);

      // Build search query
      const searchFilter = searchQuery
        ? {
            studyName: { $regex: searchQuery, $options: "i" },
          }
        : {};

      // Build category filter
      const categoryFilter = category && category !== "All" ? { category } : {};

      // Build visibility filter
      const visibilityFilter =
        isPublic !== null && isPublic !== "All"
          ? { isPublic: isPublic === "Public" || isPublic === true }
          : {};

      // Build date filter
      let dateFilterObj = {};
      if (dateFilter && dateFilter !== "All") {
        const now = new Date();
        let startDate;
        switch (dateFilter) {
          case "Last 7 days":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "Last 30 days":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "Last year":
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          dateFilterObj = { createdAt: { $gte: startDate } };
        }
      }

      // Combine all filters
      const filter = {
        ...searchFilter,
        ...categoryFilter,
        ...visibilityFilter,
        ...dateFilterObj,
      };

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Get total count
      const totalStudies = await Study.countDocuments(filter);

      // Get studies with pagination
      const studies = await Study.find(filter)
        .populate("createdBy", "username")
        .select(
          "studyName category description isPublic likes createdAt updatedAt createdBy"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Format studies
      const formattedStudies = studies.map((study) => {
        const studyData = _.pick(study, [
          "_id",
          "studyName",
          "category",
          "description",
          "isPublic",
          "likes",
          "createdAt",
          "updatedAt",
          "createdBy",
        ]);
        return {
          ...studyData,
          _id: studyData._id.toString(),
          createdAt: studyData.createdAt.toISOString(),
          updatedAt: studyData.updatedAt
            ? studyData.updatedAt.toISOString()
            : undefined,
          createdBy: studyData.createdBy
            ? {
                _id: studyData.createdBy._id.toString(),
                username: studyData.createdBy.username,
              }
            : null,
        };
      });

      return Promise.resolve({
        studies: formattedStudies,
        totalStudies,
        currentPage: page,
        totalPages: Math.ceil(totalStudies / limit),
        pageSize: limit,
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "getAllStudies function is not supported for this database"
  );
};

// Admin update study metadata (name, category, description - NOT visibility)
const adminUpdateStudyMetadata = async (studyId, updateData) => {
  if (DB === "MONGODB") {
    try {
      // Check if study exists
      const study = await Study.findById(studyId);
      if (!study) {
        throw new Error("Study not found");
      }

      // Prepare update data (allow updating studyName, category, description, isPublic)
      const normalizedUpdate = {
        studyName: updateData.studyName?.trim(),
        category: updateData.category,
        description: updateData.description?.trim() || "",
        isPublic: updateData.isPublic,
      };

      // Remove undefined fields
      Object.keys(normalizedUpdate).forEach(
        (key) =>
          normalizedUpdate[key] === undefined && delete normalizedUpdate[key]
      );

      // Update the study
      const updatedStudy = await Study.findByIdAndUpdate(
        studyId,
        { $set: normalizedUpdate },
        { new: true, runValidators: true }
      )
        .populate("createdBy", "username")
        .lean();

      if (!updatedStudy) {
        throw new Error("Failed to update study");
      }

      const studyData = _.pick(updatedStudy, [
        "_id",
        "studyName",
        "category",
        "description",
        "isPublic",
        "likes",
        "createdAt",
        "updatedAt",
        "createdBy",
      ]);

      return Promise.resolve({
        ...studyData,
        _id: studyData._id.toString(),
        createdAt: studyData.createdAt.toISOString(),
        updatedAt: studyData.updatedAt
          ? studyData.updatedAt.toISOString()
          : undefined,
        createdBy: studyData.createdBy
          ? {
              _id: studyData.createdBy._id.toString(),
              username: studyData.createdBy.username,
            }
          : null,
      });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "adminUpdateStudyMetadata function is not supported for this database"
  );
};

// Admin delete study (bypass ownership check)
const adminDeleteStudy = async (studyId) => {
  if (DB === "MONGODB") {
    try {
      // Check if study exists
      const study = await Study.findById(studyId);
      if (!study) {
        throw new Error("Study not found");
      }

      // Delete all likes associated with this study
      await StudyLike.deleteMany({ study: studyId });

      // Delete the study
      await Study.deleteOne({ _id: studyId });

      return Promise.resolve({ message: "Study deleted successfully" });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "adminDeleteStudy function is not supported for this database"
  );
};

module.exports = {
  getAllStudies,
  adminUpdateStudyMetadata,
  adminDeleteStudy,
};

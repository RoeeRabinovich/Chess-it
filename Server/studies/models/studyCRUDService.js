const Study = require("./mongodb/Study");
const StudyLike = require("./mongodb/StudyLike");
const config = require("config");
const { handleBadRequest } = require("../../utils/errorHandler");

// Database selection
const DB = config.get("DB");

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

// Update a study
const updateStudy = async (userId, studyId, updateData) => {
  if (DB === "MONGODB") {
    try {
      // Check if study exists and user is the owner
      const study = await Study.findById(studyId);
      if (!study) {
        const error = new Error("Study not found");
        error.status = 404;
        throw error;
      }

      // Verify ownership
      const studyCreatorId = study.createdBy.toString();
      if (studyCreatorId !== userId.toString()) {
        const error = new Error(
          "Access denied. You can only update your own studies."
        );
        error.status = 403;
        throw error;
      }

      // Prepare update data (only allow updating studyName, description, isPublic)
      const normalizedUpdate = {
        studyName: updateData.studyName?.trim(),
        description: updateData.description?.trim() || "",
        isPublic: updateData.isPublic,
      };

      // Update the study
      const updatedStudy = await Study.findByIdAndUpdate(
        studyId,
        { $set: normalizedUpdate },
        { new: true, runValidators: true }
      ).populate("createdBy", "username email");

      if (!updatedStudy) {
        const error = new Error("Failed to update study");
        error.status = 400;
        throw error;
      }

      return Promise.resolve(updatedStudy);
    } catch (error) {
      if (error.status) {
        return Promise.reject(error);
      }
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "updateStudy function is not supported for this database"
  );
};

// Delete a study
const deleteStudy = async (userId, studyId) => {
  if (DB === "MONGODB") {
    try {
      // Check if study exists and user is the owner
      const study = await Study.findById(studyId);
      if (!study) {
        const error = new Error("Study not found");
        error.status = 404;
        throw error;
      }

      // Verify ownership
      const studyCreatorId = study.createdBy.toString();
      if (studyCreatorId !== userId.toString()) {
        const error = new Error(
          "Access denied. You can only delete your own studies."
        );
        error.status = 403;
        throw error;
      }

      // Delete all likes associated with this study
      await StudyLike.deleteMany({ study: studyId });

      // Delete the study
      await Study.deleteOne({ _id: studyId });

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
    "deleteStudy function is not supported for this database"
  );
};

module.exports = {
  createStudy,
  updateStudy,
  deleteStudy,
};


// Re-export all data access functions from specialized service files
const { createStudy, updateStudy, deleteStudy } = require("./studyCRUDService");

const {
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
} = require("./studyQueryService");

const {
  likeStudy,
  unlikeStudy,
  getUserLikedStudyIds,
} = require("./studyLikeService");

module.exports = {
  createStudy,
  findStudyById,
  findStudiesByUser,
  findPublicStudies,
  likeStudy,
  unlikeStudy,
  getUserLikedStudyIds,
  updateStudy,
  deleteStudy,
};

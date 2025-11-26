const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const {
  createStudyService,
  getStudyByIdService,
  getUserStudiesService,
  getPublicStudiesService,
  likeStudyService,
  unlikeStudyService,
  getUserLikedStudyIdsService,
  deleteStudyService,
} = require("../services/studiesService");
const { auth, optionalAuth } = require("../../auth/authService");
const { generalRateLimiter } = require("../../middlewares/rateLimiter");

// Routes - handles the HTTP requests and responses. (frontend to backend)

// Create a new study
router.post("/create", auth, generalRateLimiter, async (req, res) => {
  try {
    const userId = req.user._id;
    const study = await createStudyService(userId, req.body);
    res.status(200).json(study);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Get all studies by authenticated user
// Must come before /:id to avoid route conflict
router.get("/my-studies", auth, generalRateLimiter, async (req, res) => {
  try {
    const userId = req.user._id;
    const studies = await getUserStudiesService(userId);
    res.status(200).json(studies);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Get public studies with filters
// Query params: category (All, Opening, Endgame, Strategy, Tactics), filter (All, New, Popular), search, limit, skip, likedOnly
router.get("/public", optionalAuth, generalRateLimiter, async (req, res) => {
  try {
    const { category, filter, search, limit, skip, likedOnly } = req.query;
    const userId = req.user?._id || null;
    const studies = await getPublicStudiesService({
      category: category || "All",
      filter: filter || "All",
      search: search || "",
      limit,
      skip,
      userId,
      likedOnly: likedOnly === "true" || likedOnly === true,
    });
    res.status(200).json(studies);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Like a study
router.post("/:id/like", auth, generalRateLimiter, async (req, res) => {
  try {
    const studyId = req.params.id;
    const userId = req.user._id;
    await likeStudyService(userId, studyId);
    res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Unlike a study
router.delete("/:id/like", auth, generalRateLimiter, async (req, res) => {
  try {
    const studyId = req.params.id;
    const userId = req.user._id;
    await unlikeStudyService(userId, studyId);
    res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Get user's liked study IDs
router.get("/liked/ids", auth, generalRateLimiter, async (req, res) => {
  try {
    const userId = req.user._id;
    const studyIds = await getUserLikedStudyIdsService(userId);
    res.status(200).json(studyIds);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Delete a study
// Must come before /:id to avoid route conflict
router.delete("/:id", auth, generalRateLimiter, async (req, res) => {
  try {
    const studyId = req.params.id;
    const userId = req.user._id;
    await deleteStudyService(userId, studyId);
    res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Get study by ID
// Optional auth: if authenticated, can access private studies owned by user
// If not authenticated, can only access public studies
router.get("/:id", optionalAuth, generalRateLimiter, async (req, res) => {
  try {
    const studyId = req.params.id;
    const userId = req.user?._id || null; // Optional auth
    const study = await getStudyByIdService(studyId, userId);
    res.status(200).json(study);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const {
  createStudyService,
  getStudyByIdService,
  getUserStudiesService,
} = require("../services/studiesService");
const { auth, optionalAuth } = require("../../auth/authService");

// Routes - handles the HTTP requests and responses. (frontend to backend)

// Create a new study
router.post("/create", auth, async (req, res) => {
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
router.get("/my-studies", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const studies = await getUserStudiesService(userId);
    res.status(200).json(studies);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Get study by ID
// Optional auth: if authenticated, can access private studies owned by user
// If not authenticated, can only access public studies
router.get("/:id", optionalAuth, async (req, res) => {
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

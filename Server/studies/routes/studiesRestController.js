const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const { createStudyService } = require("../services/studiesService");
const { auth } = require("../../auth/authService");

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

module.exports = router;

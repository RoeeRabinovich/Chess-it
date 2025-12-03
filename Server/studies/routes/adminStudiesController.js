const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const { adminAuth } = require("../../middlewares/adminAuth");
const {
  getAllStudiesService,
  adminUpdateStudyMetadataService,
  adminDeleteStudyService,
} = require("../services/adminStudiesService");
const { generalRateLimiter } = require("../../middlewares/rateLimiter");

// Get all studies with pagination, search, and filters (admin only)
router.get("/", adminAuth, generalRateLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "All";
    const isPublic = req.query.isPublic || "All";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const dateFilter = req.query.dateFilter || "All";

    const result = await getAllStudiesService(
      page,
      pageSize,
      search,
      category,
      isPublic,
      sortBy,
      sortOrder,
      dateFilter
    );
    res.status(200).json(result);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Update study metadata (admin only - name, category, description, isPublic)
router.patch("/:id", adminAuth, generalRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { studyName, category, description, isPublic } = req.body;

    // Convert isPublic to boolean if it's a string
    const isPublicBoolean =
      typeof isPublic === "string" ? isPublic === "true" : Boolean(isPublic);

    const study = await adminUpdateStudyMetadataService(id, {
      studyName,
      category,
      description,
      isPublic: isPublicBoolean,
    });
    res.status(200).json(study);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

// Delete study (admin only)
router.delete("/:id", adminAuth, generalRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminDeleteStudyService(id);
    res.status(200).json(result);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

module.exports = router;

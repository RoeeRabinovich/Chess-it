const express = require("express");
const router = express.Router();
const stockfishService = require("../services/stockfishService");
const {
  validateAnalyzeRequest,
} = require("../validations/stockfishValidatorService");

// POST /analyze - Analyze a chess position
router.post("/analyze", async (req, res) => {
  try {
    // Validate request body
    const validatedData = validateAnalyzeRequest(req.body);

    // Analyze position with validated data
    const result = await stockfishService.analyzePosition(
      validatedData.fen,
      validatedData.depth,
      validatedData.multipv,
      validatedData.analysisMode
    );

    res.json(result);
  } catch (error) {
    // Return appropriate error status
    const statusCode =
      error.message.includes("Invalid") || error.message.includes("must be")
        ? 400
        : 500;

    res.status(statusCode).json({
      error: error.message || "Analysis failed",
    });
  }
});

module.exports = router;

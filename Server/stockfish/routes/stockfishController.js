const express = require("express");
const router = express.Router();
const stockfishService = require("../services/stockfishService");
const {
  validateAnalyzeRequest,
} = require("../validations/stockfishValidatorService");
const { stockfishRateLimiter } = require("../../middlewares/rateLimiter");

// POST /analyze - Analyze a chess position
router.post("/analyze", stockfishRateLimiter, async (req, res) => {
  const startTime = Date.now();
  console.log("[DEBUG] /analyze route called:", { body: req.body, timestamp: new Date().toISOString() });
  try {
    // Validate request body
    console.log("[DEBUG] Validating request");
    const validatedData = validateAnalyzeRequest(req.body);
    console.log("[DEBUG] Validation passed, calling analyzePosition:", { fen: validatedData.fen, depth: validatedData.depth, multipv: validatedData.multipv, mode: validatedData.analysisMode });

    // Analyze position with validated data
    const result = await stockfishService.analyzePosition(
      validatedData.fen,
      validatedData.depth,
      validatedData.multipv,
      validatedData.analysisMode
    );
    console.log("[DEBUG] analyzePosition resolved, sending response:", { hasResult: !!result, depth: result?.depth });

    res.json(result);
    console.log("[DEBUG] Response sent, duration:", Date.now() - startTime, "ms");
  } catch (error) {
    console.error("[DEBUG] Error caught in controller:", { errorMessage: error?.message, errorStack: error?.stack?.substring(0, 200) });
    // Return appropriate error status
    const statusCode =
      error.message.includes("Invalid") || error.message.includes("must be")
        ? 400
        : 500;

    res.status(statusCode).json({
      error: error.message || "Analysis failed",
    });
    console.log("[DEBUG] Error response sent:", { statusCode, duration: Date.now() - startTime + "ms" });
  }
});

module.exports = router;

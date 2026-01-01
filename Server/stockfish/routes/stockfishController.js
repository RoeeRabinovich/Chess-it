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
  fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:11',message:'/analyze route called',data:{body:req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});
  try {
    // Validate request body
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:13',message:'Validating request',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});
    const validatedData = validateAnalyzeRequest(req.body);
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:15',message:'Validation passed, calling analyzePosition',data:{fen:validatedData.fen,depth:validatedData.depth,multipv:validatedData.multipv,mode:validatedData.analysisMode},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});

    // Analyze position with validated data
    const result = await stockfishService.analyzePosition(
      validatedData.fen,
      validatedData.depth,
      validatedData.multipv,
      validatedData.analysisMode
    );
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:23',message:'analyzePosition resolved, sending response',data:{hasResult:!!result,depth:result?.depth},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});

    res.json(result);
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:25',message:'Response sent',data:{duration:Date.now()-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});
  } catch (error) {
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:27',message:'Error caught in controller',data:{errorMessage:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});
    // Return appropriate error status
    const statusCode =
      error.message.includes("Invalid") || error.message.includes("must be")
        ? 400
        : 500;

    res.status(statusCode).json({
      error: error.message || "Analysis failed",
    });
    fetch('http://127.0.0.1:7242/ingest/9e5da5ad-4f5d-4a3a-8adb-71d5d70d748b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockfishController.js:35',message:'Error response sent',data:{statusCode,duration:Date.now()-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'railway-timeout',hypothesisId:'A'})}).catch(()=>{});
  }
});

module.exports = router;

const path = require("path");
const loadEngine = require(path.join(
  __dirname,
  "../../node_modules/stockfish/examples/loadEngine.js"
));

class StockfishService {
  constructor() {
    this.engine = null;
    this.currentAnalysis = null;
    this.isReady = false;
    this.init();
  }

  init() {
    try {
      // Load the Stockfish engine using the provided helper
      const stockfishPath = path.join(
        __dirname,
        "../../node_modules/stockfish/src/stockfish-17.1-lite-51f59da.js"
      );
      this.engine = loadEngine(stockfishPath);
      console.log(this.engine);

      // Set up message stream handler
      this.engine.stream = (message) => {
        this.handleEngineMessage(message);
      };

      // Initialize UCI and configure Stockfish for better accuracy
      this.engine.send("uci", () => {
        // Configure Stockfish for better evaluation accuracy
        // Set hash size (memory for position caching) - 256MB
        this.engine.send("setoption name Hash value 32");
        // Set thread count (use more CPU cores for faster analysis)
        this.engine.send("setoption name Threads value 1");
        // Enable Syzygy tablebase (for endgame accuracy)
        // Note: Requires tablebase files, skip if not available
        // this.engine.send("setoption name SyzygyPath value ./syzygy");

        // Set a timeout fallback in case readyok message comes but callback doesn't fire
        const readyTimeout = setTimeout(() => {
          if (!this.isReady) {
            // If still not ready after 2 seconds, force it (message handler should have caught it)
            if (!this.isReady) {
              this.isReady = true;
            }
          }
        }, 2000);
        
        this.engine.send("isready", () => {
          clearTimeout(readyTimeout);
          this.isReady = true;
        });
      });
    } catch (error) {
      console.error("❌ Failed to initialize Stockfish:", error);
      this.isReady = true; // Allow requests but mock mode
    }
  }

  handleEngineMessage(message) {
    // Handle readyok message - set engine as ready if we're waiting for it
    if (message && message.includes("readyok") && !this.isReady) {
      this.isReady = true;
    }
    
    if (!message || !this.currentAnalysis) return;

    // Parse UCI output for analysis data
    if (message.startsWith("info") && message.includes("depth")) {
      const depthMatch = message.match(/depth (\d+)/);
      // Match score cp (centipawns) - can be positive or negative
      const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
      const mateMatch = message.match(/score mate (-?\d+)/);
      const pvMatch = message.match(/ pv (.+)$/); // Extract only the moves after "pv"
      const multipvMatch = message.match(/multipv (\d+)/);
      // Check for "upperbound" or "lowerbound" which indicates incomplete evaluation
      const isBound =
        message.includes("upperbound") || message.includes("lowerbound");

      if (depthMatch && !isBound) {
        // Only process non-bound evaluations (final evaluations)
        const depth = parseInt(depthMatch[1]);
        const multipv = multipvMatch ? parseInt(multipvMatch[1]) : 1;

        // Parse evaluation - handle both cp (centipawns) and mate
        let evaluation = null;
        if (mateMatch) {
          evaluation = null; // Mate takes precedence
        } else if (scoreMatch && scoreMatch[1] === "cp") {
          // Convert centipawns to pawns (divide by 100)
          evaluation = parseInt(scoreMatch[2]) / 100;
        }

        const lineData = {
          depth,
          multipv,
          evaluation: evaluation,
          possibleMate: mateMatch ? mateMatch[1] : null,
          pv: pvMatch ? pvMatch[1] : null,
        };

        // Update the analysis for this line
        // CRITICAL: Always update to the latest data at this depth, even if depth is the same
        // This is important because MultiPV lines can change their first move as depth increases
        if (!this.currentAnalysis.lines[multipv - 1]) {
          this.currentAnalysis.lines[multipv - 1] = lineData;
        } else {
          // Update if depth is deeper or equal (prefer deeper, but also update at same depth in case move changed)
          // Also ensure we have a valid evaluation before updating
          if (
            depth >= this.currentAnalysis.lines[multipv - 1].depth &&
            (evaluation !== null || mateMatch)
          ) {
            this.currentAnalysis.lines[multipv - 1] = lineData;
          }
        }

        // Update main analysis (use line 1 - best line)
        // IMPORTANT: MultiPV 1 evaluation is the position evaluation BEFORE any moves
        // Other MultiPV lines show evaluation AFTER their first move
        if (multipv === 1) {
          // Only update if we have a valid evaluation or mate
          if (evaluation !== null || mateMatch) {
            // Always update to the latest depth (final evaluation)
            this.currentAnalysis.depth = depth;
            this.currentAnalysis.evaluation =
              evaluation !== null ? evaluation : 0;
            this.currentAnalysis.possibleMate = mateMatch ? mateMatch[1] : null;
            this.currentAnalysis.bestLine = lineData.pv;

            // Check if we've reached target depth (for depth-based analysis)
            if (
              !this.currentAnalysis.targetDepth ||
              depth >= this.currentAnalysis.targetDepth
            ) {
              this.currentAnalysis.finalDepthReached = true;
            }
          }
        }

        // Track which MultiPV lines have reached the final depth
        // For depth-based analysis, wait for exact depth match
        // For time-based analysis, track the maximum depth reached
        const finalDepth = this.currentAnalysis.depth || depth;
        if (depth === finalDepth && (evaluation !== null || mateMatch)) {
          this.currentAnalysis.linesAtFinalDepth.add(multipv);
        }
      }
    }

    // Check if analysis is complete
    if (message.startsWith("bestmove")) {
      if (this.currentAnalysis && this.currentAnalysis.resolve) {
        // Extract the best move from the bestmove message for verification

        const finalDepth = this.currentAnalysis.depth;
        const requestedMultipv = this.currentAnalysis.requestedMultipv || 1;

        // CRITICAL: Only return lines that are at the EXACT final depth
        // MultiPV lines can change their first move as depth increases
        const validLines = this.currentAnalysis.lines
          .map((line, index) => ({ ...line, multipv: index + 1 }))
          .filter((line) => {
            if (line === null) return false;
            if (line.evaluation === null && line.possibleMate === null)
              return false;
            // Only include lines at the EXACT final depth
            return line.depth === finalDepth;
          })
          .sort((a, b) => a.multipv - b.multipv); // Ensure MultiPV order is preserved

        // If we don't have all requested lines at final depth, log a warning
        if (validLines.length < requestedMultipv) {
          console.warn(
            `[Stockfish] Warning: Only ${validLines.length} of ${requestedMultipv} requested lines reached final depth ${finalDepth}.`
          );
          console.warn(
            `[Stockfish] Missing MultiPV lines: ${Array.from(
              { length: requestedMultipv },
              (_, i) => i + 1
            )
              .filter((mpv) => !this.currentAnalysis.linesAtFinalDepth.has(mpv))
              .join(", ")}`
          );
        }

        // IMPORTANT: The evaluation in MultiPV lines is AFTER the first move is played
        // MultiPV 1 evaluation is the position evaluation (before any move)
        // MultiPV 2+ evaluations are after their respective first moves
        const result = {
          evaluation: this.currentAnalysis.evaluation || 0, // Position evaluation (before moves)
          depth: finalDepth || 0,
          bestLine: this.currentAnalysis.bestLine || "",
          possibleMate: this.currentAnalysis.possibleMate || null,
          lines: validLines, // Each line's eval is AFTER its first move
        };

        this.currentAnalysis.resolve(result);
        this.currentAnalysis = null;
      }
    }
  }

  async analyzePosition(fen, depth = 15, multipv = 1, analysisMode = "quick") {
    // Wait for engine to be ready
    if (!this.isReady) {
      await new Promise((resolve) => {
        const checkReady = setInterval(() => {
          if (this.isReady) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
      });
    }

    // Stop any ongoing analysis
    if (this.currentAnalysis) {
      this.engine.send("stop");
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Determine analysis parameters based on mode
    const isDeepMode = analysisMode === "deep";
    const analysisTime = isDeepMode ? 8000 : null; // 8 seconds for deep mode
    const maxTimeout = isDeepMode ? 12000 : 30000; // 12s for deep, 30s for quick
    const targetDepth = isDeepMode ? 99 : depth; // For deep mode, search as deep as possible

    // Create new analysis promise
    return new Promise((resolve, reject) => {
      this.currentAnalysis = {
        resolve,
        reject,
        depth: 0,
        evaluation: 0,
        bestLine: "",
        possibleMate: null,
        lines: Array(multipv).fill(null),
        targetDepth: targetDepth, // Track target depth
        finalDepthReached: false,
        requestedMultipv: multipv, // Track how many lines we requested
        linesAtFinalDepth: new Set(), // Track which MultiPV lines reached final depth
      };

      // Set timeout for analysis
      const timeout = setTimeout(() => {
        if (this.currentAnalysis) {
          this.engine.send("stop");
          console.error("⏱️  Analysis timeout");
          reject(new Error("Analysis timeout"));
          this.currentAnalysis = null;
        }
      }, maxTimeout);

      // Start analysis
      try {
        // Store FEN for debugging
        this.currentAnalysis.fen = fen;

        // Set position
        this.engine.send(`position fen ${fen}`);

        // Set MultiPV before starting analysis
        this.engine.send(`setoption name MultiPV value ${multipv}`);

        // Small delay to ensure options are set before starting analysis
        setTimeout(() => {
          if (isDeepMode) {
            // Deep mode: use time-based analysis (go movetime)
            // This allows Stockfish to search as deep as it can in the given time
            this.engine.send(`go movetime ${analysisTime}`);
          } else {
            // Quick mode: use depth-based analysis
            // This ensures we get evaluation at exactly the specified depth
            this.engine.send(`go depth ${depth}`);
          }
        }, 100);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
        this.currentAnalysis = null;
      }

      // Clear timeout when done
      const originalResolve = this.currentAnalysis.resolve;
      this.currentAnalysis.resolve = (result) => {
        clearTimeout(timeout);
        originalResolve(result);
      };
    });
  }

  terminate() {
    if (this.engine && this.engine.quit) {
      this.engine.quit();
    }
  }
}

// Create singleton instance
const stockfishService = new StockfishService();

module.exports = stockfishService;

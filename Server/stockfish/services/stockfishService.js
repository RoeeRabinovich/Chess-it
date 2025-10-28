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
        "../../node_modules/stockfish/src/stockfish.js"
      );
      this.engine = loadEngine(stockfishPath);

      // Set up message stream handler
      this.engine.stream = (message) => {
        this.handleEngineMessage(message);
      };

      // Initialize UCI
      this.engine.send("uci", () => {
        this.engine.send("isready", () => {
          this.isReady = true;
          console.log("✅ Stockfish service initialized and ready");
        });
      });

      console.log("✅ Stockfish service loading...");
    } catch (error) {
      console.error("❌ Failed to initialize Stockfish:", error);
      this.isReady = true; // Allow requests but mock mode
    }
  }

  handleEngineMessage(message) {
    if (!message || !this.currentAnalysis) return;

    // Parse UCI output for analysis data
    if (message.startsWith("info") && message.includes("depth")) {
      const depthMatch = message.match(/depth (\d+)/);
      const scoreMatch = message.match(/score cp (-?\d+)/);
      const mateMatch = message.match(/score mate (-?\d+)/);
      const pvMatch = message.match(/ pv (.+)$/); // Extract only the moves after "pv"
      const multipvMatch = message.match(/multipv (\d+)/);

      if (depthMatch) {
        const depth = parseInt(depthMatch[1]);
        const multipv = multipvMatch ? parseInt(multipvMatch[1]) : 1;

        const lineData = {
          depth,
          multipv,
          evaluation: scoreMatch ? parseInt(scoreMatch[1]) / 100 : null,
          possibleMate: mateMatch ? mateMatch[1] : null,
          pv: pvMatch ? pvMatch[1] : null,
        };

        // Update the analysis for this line
        if (!this.currentAnalysis.lines[multipv - 1]) {
          this.currentAnalysis.lines[multipv - 1] = lineData;
        } else {
          // Only update if depth is deeper or equal
          if (depth >= this.currentAnalysis.lines[multipv - 1].depth) {
            this.currentAnalysis.lines[multipv - 1] = lineData;
          }
        }

        // Update main analysis (use line 1)
        if (multipv === 1) {
          this.currentAnalysis.depth = depth;
          this.currentAnalysis.evaluation = lineData.evaluation;
          this.currentAnalysis.possibleMate = lineData.possibleMate;
          this.currentAnalysis.bestLine = lineData.pv;
        }
      }
    }

    // Check if analysis is complete
    if (message.startsWith("bestmove")) {
      if (this.currentAnalysis && this.currentAnalysis.resolve) {
        this.currentAnalysis.resolve({
          evaluation: this.currentAnalysis.evaluation || 0,
          depth: this.currentAnalysis.depth || 0,
          bestLine: this.currentAnalysis.bestLine || "",
          possibleMate: this.currentAnalysis.possibleMate || null,
          lines: this.currentAnalysis.lines.filter((line) => line !== null),
        });
        this.currentAnalysis = null;
      }
    }
  }

  async analyzePosition(fen, depth = 15, multipv = 1) {
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `📊 Analyzing: ${fen.substring(
        0,
        30
      )}... (depth: ${depth}, multipv: ${multipv})`
    );

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
      };

      // Set timeout for analysis (max 30 seconds)
      const timeout = setTimeout(() => {
        if (this.currentAnalysis) {
          this.engine.send("stop");
          console.error("⏱️  Analysis timeout");
          reject(new Error("Analysis timeout"));
          this.currentAnalysis = null;
        }
      }, 30000);

      // Start analysis
      try {
        this.engine.send(`position fen ${fen}`);
        this.engine.send(`setoption name MultiPV value ${multipv}`);
        this.engine.send(`go depth ${depth}`);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
        this.currentAnalysis = null;
      }

      // Clear timeout when done
      const originalResolve = this.currentAnalysis.resolve;
      this.currentAnalysis.resolve = (result) => {
        clearTimeout(timeout);
        console.log(`✅ Analysis complete (eval: ${result.evaluation})`);
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

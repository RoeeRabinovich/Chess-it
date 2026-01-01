require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const router = require("./router/router");
const chalk = require("chalk");
const config = require("config");
const connectToDb = require("./DB/dbService");
const cors = require("./middlewares/cors");
const sanitize = require("./middlewares/sanitize");
const helmet = require("./middlewares/helmet");
const { handleError } = require("./utils/errorHandler");
const logger = require("./logger/loggers/morganLogger");

// Middlewares
// Apply Helmet first for security headers
app.use(helmet);
app.use(cors);
app.use(logger);
app.use(express.json());
app.use(express.text());
// Apply sanitization after parsing JSON/text but before routes
app.use(sanitize);

// Serve static files from public directory (built client)
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", router);

//Error Handling Middleware
app.use((err, req, res, next) => {
  handleError(res, err.status || 500, err.message || "Internal Server Error");
});

// Serve React app for all non-API routes (SPA routing)
// This must be last, after error handler, to catch all unmatched routes
app.get("*", (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    // API route not found
    handleError(res, 404, "API endpoint not found");
  }
});

// Initialize Server
// Railway sets PORT as environment variable, fallback to config
const PORT = process.env.PORT || config.get("PORT");
app.listen(PORT, () => {
  console.log(chalk.greenBright(`Server is running on port ${PORT}`));
  connectToDb();
});

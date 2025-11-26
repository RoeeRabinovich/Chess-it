require("dotenv").config();
const express = require("express");
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
app.use(express.static("./public"));
app.use(router);

//Error Handling Middleware
app.use((err, req, res, next) => {
  handleError(res, err.status || 500, err.message || "Internal Server Error");
});

// Initialize Server
const PORT = config.get("PORT");
app.listen(PORT, () => {
  console.log(chalk.greenBright(`Server is running on port ${PORT}`));
  connectToDb();
});

require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./router/router");
const chalk = require("chalk");
const config = require("config");
const connectToDb = require("./DB/dbService");
const cors = require("./middlewares/cors");
const { handleError } = require("./utils/errorHandler");
const logger = require("./logger/loggers/morganLogger");

// Middlewares
app.use(cors);
app.use(logger);
app.use(express.json());
app.use(express.text());
app.use(express.static("./public"));
app.use(router);

//Error Handling Middleware
app.use((err, req, res, next) => {
  handleError(res, err.status, err.message) || 500, err.message;
});

// Initialize Server
const PORT = config.get("PORT");
app.listen(PORT, () => {
  console.log(chalk.greenBright(`Server is running on port ${PORT}`));
  connectToDb();
});

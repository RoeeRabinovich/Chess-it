require("dotenv").config();
const express = require("express");
const chalk = require("chalk");
const config = require("config");
const connectToDb = require("./DB/dbService");

const app = express();
const PORT = config.get("PORT");

app.listen(PORT, () => {
  console.log(chalk.greenBright(`Server is running on port ${PORT}`));
  connectToDb();
});

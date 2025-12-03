const mongoose = require("mongoose");
const chalk = require("chalk");
const initializeStudies = require("../initialData/initialDataService");

mongoose
  .connect("mongodb://localhost:27017/chess-it")
  .then(() => {
    console.log(chalk.greenBright("Connect Locally To MongoDB!"));
    // Initialize studies after connection
    initializeStudies();
  })
  .catch((error) => {
    console.log(chalk.redBright(error));
  });

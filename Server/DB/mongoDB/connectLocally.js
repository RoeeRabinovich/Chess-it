const mongoose = require("mongoose");
const chalk = require("chalk");
const initializeAll = require("../initialData/initialDataService");

mongoose
  .connect("mongodb://localhost:27017/chess-it")
  .then(() => {
    console.log(chalk.greenBright("Connect Locally To MongoDB!"));
    // Initialize users and studies after connection
    initializeAll();
  })
  .catch((error) => {
    console.log(chalk.redBright(error));
  });

const mongoose = require("mongoose");
const chalk = require("chalk");

mongoose
  .connect("mongodb://localhost:27017/chess-it")
  .then(() => console.log(chalk.greenBright("Connect Locally To MongoDB!")))
  .catch((error) => {
    console.log(chalk.redBright(error));
  });

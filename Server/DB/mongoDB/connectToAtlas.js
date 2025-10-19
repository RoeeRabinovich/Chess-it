const mongoose = require("mongoose");
const chalk = require("chalk");

const URI = process.env.MONGODB_URI;
mongoose
  .connect(URI)
  .then(() => console.log(chalk.greenBright("Connect to atlas MongoDb")))
  .catch((error) => {
    console.log(chalk.redBright(error));
  });

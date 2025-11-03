const mongoose = require("mongoose");
const chalk = require("chalk");

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error(chalk.redBright("MONGODB_URI environment variable is not set"));
  process.exit(1);
}

mongoose
  .connect(URI)
  .then(() => console.log(chalk.greenBright("Connect to atlas MongoDb")))
  .catch((error) => {
    console.log(chalk.redBright(error));
    process.exit(1);
  });

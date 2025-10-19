const morgan = require("morgan");
const chalk = require("chalk");

const logger = morgan((tokens, req, res) => {
  const status = Number(tokens.status(req, res));

  const logMessage = [
    tokens.date(req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    status,
    "-",
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");
  return (status >= 400 ? chalk.redBright : chalk.green)(logMessage);
});

module.exports = logger;

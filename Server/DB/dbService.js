const config = require("config");

const ENV = config.get("NODE_ENV");
const connectToDb = () => {
  // If MONGODB_URI is set, use Atlas connection (works for Railway and local dev with Atlas)
  if (process.env.MONGODB_URI) {
    require("./mongoDB/connectToAtlas");
  } else if (ENV === "development") {
    require("./mongoDB/connectLocally");
  } else if (ENV === "production") {
    require("./mongoDB/connectToAtlas");
  }
};

module.exports = connectToDb;

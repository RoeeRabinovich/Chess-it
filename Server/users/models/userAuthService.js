const User = require("./mongodb/User");
const config = require("config");
const _ = require("lodash");
const { handleBadRequest } = require("../../utils/errorHandler");
const { compareUserPassword } = require("../helpers/bcrypt");
const { generateAuthToken } = require("../../auth/providers/jwt");

// Database selection
const DB = config.get("DB");

// Create new user
const registerUser = async (normalizedUser) => {
  if (DB === "MONGODB") {
    try {
      const { email } = normalizedUser;
      let user = await User.findOne({ email });
      if (user) throw new Error("Registration Error: User Already Exists");

      user = new User(normalizedUser);
      user = await user.save();

      user = _.pick(user, ["_id", "username", "email", "createdAt"]);
      return Promise.resolve(user);
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "registerUser function is not supported for this database"
  );
};

// Login user
const loginUser = async ({ email, password }) => {
  if (DB === "MONGODB") {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Authentication Error: User Not Found");

      const isPasswordValid = await compareUserPassword(
        password,
        user.password
      );
      if (!isPasswordValid)
        throw new Error("Authentication Error: Invalid Password");

      const token = generateAuthToken(user);
      const userData = _.pick(user, [
        "_id",
        "username",
        "email",
        "createdAt",
        "puzzleRating",
      ]);
      return Promise.resolve({ token, user: userData });
    } catch (error) {
      error.status = 400;
      return handleBadRequest("Mongoose", error);
    }
  }
  return Promise.resolve(
    "loginUser function is not supported for this database"
  );
};

module.exports = {
  registerUser,
  loginUser,
};


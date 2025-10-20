const bcrypt = require("bcryptjs");

const generateUserPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const compareUserPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = { generateUserPassword, compareUserPassword };

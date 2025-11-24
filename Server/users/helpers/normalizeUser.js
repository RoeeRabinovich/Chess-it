const normalizeUser = (rawUser) => {
  const user = {
    ...rawUser,
    createdAt: rawUser?.createdAt || new Date(),
  };
  return user;
};

module.exports = normalizeUser;

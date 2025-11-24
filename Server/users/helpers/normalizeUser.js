const normalizeUser = (rawUser) => {
  const image = {
    url: rawUser?.image?.url || "",
    alt: rawUser?.image?.alt || "User Image",
  };
  const user = {
    ...rawUser,
    image,
    createdAt: rawUser?.createdAt || new Date(),
  };
  return user;
};

module.exports = normalizeUser;

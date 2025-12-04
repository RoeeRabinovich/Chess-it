const Study = require("../../studies/models/mongodb/Study");
const User = require("../../users/models/mongodb/User");
const initialStudyData = require("./initialStudyData.json");
const initialUserData = require("./initialUserData.json");
const { hashUserPassword } = require("../../users/helpers/bcrypt");
const chalk = require("chalk");

const normalizeComments = (comments = {}) => {
  if (comments instanceof Map) {
    return normalizeComments(Object.fromEntries(comments.entries()));
  }
  if (typeof comments !== "object" || comments === null) {
    return {};
  }
  const sortedKeys = Object.keys(comments).sort();
  return sortedKeys.reduce((acc, key) => {
    acc[key] = comments[key];
    return acc;
  }, {});
};

const normalizeStudy = (study) => {
  const {
    studyName,
    category,
    description = "",
    isPublic = true,
    gameState,
  } = study;

  return JSON.stringify({
    studyName,
    category,
    description,
    isPublic,
    gameState: {
      position: gameState?.position || "",
      moveTree: gameState?.moveTree || [],
      rootBranches: Array.isArray(gameState?.rootBranches)
        ? gameState.rootBranches
        : [],
      currentPath: Array.isArray(gameState?.currentPath)
        ? gameState.currentPath
        : [],
      isFlipped: !!gameState?.isFlipped,
      opening: gameState?.opening || null,
      comments: normalizeComments(gameState?.comments || {}),
    },
  });
};

/**
 * Initialize users in the database.
 * Checks if users with specific emails already exist and creates only missing ones.
 */
const initializeUsers = async () => {
  try {
    const existingEmails = new Set();
    const existingUsers = await User.find({}, "email").lean();
    existingUsers.forEach((user) => {
      existingEmails.add(user.email.toLowerCase());
    });

    const usersToCreate = initialUserData.filter((userData) => {
      return !existingEmails.has(userData.email.toLowerCase());
    });

    if (usersToCreate.length === 0) {
      console.log(
        chalk.green("Initial users already present. No new users created.")
      );
      return;
    }

    console.log(
      chalk.blue(`Creating ${usersToCreate.length} missing initial user(s)...`)
    );

    const usersWithHashedPasswords = await Promise.all(
      usersToCreate.map(async (userData) => {
        const hashedPassword = await hashUserPassword(userData.password);
        return {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          isAdmin: userData.isAdmin || false,
        };
      })
    );

    const result = await User.insertMany(usersWithHashedPasswords);

    console.log(
      chalk.greenBright(
        `✅ Successfully created ${result.length} initial user${
          result.length === 1 ? "" : "s"
        }.`
      )
    );
  } catch (error) {
    console.error(chalk.redBright("❌ Error initializing users:"), error);
  }
};

/**
 * Initialize studies in the database.
 * Compares existing studies with the seed data and inserts any missing ones.
 */
const initializeStudies = async () => {
  try {
    const user = await User.findOne();

    if (!user) {
      console.log(
        chalk.yellow(
          "No users found in database. Please create a user first before initializing studies."
        )
      );
      return;
    }

    const existingStudies = await Study.find(
      {},
      "studyName category description isPublic gameState"
    ).lean();
    const existingStudySet = new Set(
      existingStudies.map((study) => normalizeStudy(study))
    );

    const studiesToCreate = initialStudyData.filter((study) => {
      const normalized = normalizeStudy(study);
      return !existingStudySet.has(normalized);
    });

    if (studiesToCreate.length === 0) {
      console.log(
        chalk.green("Initial studies already present. No new studies created.")
      );
      return;
    }

    console.log(
      chalk.blue(
        `Adding ${studiesToCreate.length} missing initial studies with user: ${user.username}`
      )
    );

    const payload = studiesToCreate.map((study) => ({
      ...study,
      createdBy: user._id,
    }));

    const result = await Study.insertMany(payload);

    console.log(
      chalk.greenBright(
        `✅ Successfully inserted ${result.length} initial stud${
          result.length === 1 ? "y" : "ies"
        }.`
      )
    );
  } catch (error) {
    console.error(chalk.redBright("❌ Error initializing studies:"), error);
  }
};

/**
 * Main initialization function.
 * Initializes users first, then studies.
 */
const initializeAll = async () => {
  await initializeUsers();
  await initializeStudies();
};

module.exports = initializeAll;

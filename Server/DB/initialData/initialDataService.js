const Study = require("../../studies/models/mongodb/Study");
const User = require("../../users/models/mongodb/User");
const initialStudyData = require("./initialStudyData.json");
const chalk = require("chalk");

/**
 * Initialize studies in the database
 * Finds any user and loads initial study data
 */
const initializeStudies = async () => {
  try {
    // Check if studies already exist
    const existingStudies = await Study.countDocuments();
    if (existingStudies > 1) {
      console.log(
        chalk.yellow(
          `Studies already exist (${existingStudies} found). Skipping initialization.`
        )
      );
      return;
    }

    // Find any user for the studies
    const user = await User.findOne();

    if (!user) {
      console.log(
        chalk.yellow(
          "No users found in database. Please create a user first before initializing studies."
        )
      );
      return;
    }

    console.log(
      chalk.blue(
        `Initializing ${initialStudyData.length} studies with user: ${user.username}`
      )
    );

    // Prepare studies with the user's ID
    const studiesToInsert = initialStudyData.map((study) => ({
      ...study,
      createdBy: user._id,
    }));

    // Insert studies
    const result = await Study.insertMany(studiesToInsert);

    console.log(
      chalk.greenBright(`✅ Successfully initialized ${result.length} studies!`)
    );
  } catch (error) {
    console.error(chalk.redBright("❌ Error initializing studies:"), error);
  }
};

module.exports = initializeStudies;

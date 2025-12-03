const express = require("express");
const router = express.Router();
const adminUsersRoutes = require("../users/routes/adminUsersController");
const adminStudiesRoutes = require("../studies/routes/adminStudiesController");

router.use("/users", adminUsersRoutes);
router.use("/studies", adminStudiesRoutes);

module.exports = router;


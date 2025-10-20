const express = require("express");
const router = express.Router();
const usersRoutes = require("../users/routes/usersRestController");
const { handleError } = require("../utils/errorHandler");

router.use("/users", usersRoutes);

router.use((req, res) => handleError(res, 404, "Route not found"));

module.exports = router;

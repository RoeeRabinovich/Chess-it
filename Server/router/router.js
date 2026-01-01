const express = require("express");
const stockfishRoutes = require("../stockfish/routes/stockfishController");
const router = express.Router();
const usersRoutes = require("../users/routes/usersRestController");
const adminRoutes = require("../routes/adminRoutes");
const studiesRoutes = require("../studies/routes/studiesRestController");
const { handleError } = require("../utils/errorHandler");

router.use("/users", usersRoutes);
router.use("/admin", adminRoutes);
router.use("/stockfish", (req, res, next) => {
  console.log("[DEBUG] Stockfish route middleware hit:", { path: req.path, method: req.method, timestamp: new Date().toISOString() });
  next();
}, stockfishRoutes);
router.use("/studies", studiesRoutes);
router.use((req, res) => handleError(res, 404, "Route not found"));

module.exports = router;

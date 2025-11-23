const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updatePuzzleRatingService,
} = require("../services/usersService");
const { auth } = require("../../auth/authService");

//Routes - handles the HTTP requests and responses. (frontend to backend)

//Register a new user

router.post("/register", async (req, res) => {
  try {
    const user = await registerUserService(req.body);
    res.status(201).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Login a user

router.post("/login", async (req, res) => {
  try {
    const user = await loginUserService(req.body);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Get user profile (requires authentication)
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await getUserProfileService(userId);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Update user puzzle rating (requires authentication)
router.patch("/puzzle-rating", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { puzzleRating } = req.body;

    if (typeof puzzleRating !== "number") {
      return handleError(res, 400, "puzzleRating must be a number");
    }

    const user = await updatePuzzleRatingService(userId, puzzleRating);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

module.exports = router;

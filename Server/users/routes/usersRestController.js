const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUsernameService,
  updatePuzzleRatingService,
  forgotPasswordService,
  resetPasswordService,
} = require("../services/usersService");
const { auth } = require("../../auth/authService");
const {
  authRateLimiter,
  generalRateLimiter,
  passwordResetLimiter,
} = require("../../middlewares/rateLimiter");

//Routes - handles the HTTP requests and responses. (frontend to backend)

//Register a new user

router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const user = await registerUserService(req.body);
    res.status(201).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Login a user

router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const user = await loginUserService(req.body);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Get user profile (requires authentication)
router.get("/profile", auth, generalRateLimiter, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await getUserProfileService(userId);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Update username (requires authentication)
router.patch("/username", auth, generalRateLimiter, async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;

    if (!username) {
      return handleError(res, 400, "Username is required");
    }

    const user = await updateUsernameService(userId, username);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Update user puzzle rating (requires authentication)
router.patch("/puzzle-rating", auth, generalRateLimiter, async (req, res) => {
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

//Request password reset (forgot password)
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const frontendUrl = req.headers.origin || "http://localhost:5173";

    const result = await forgotPasswordService(email, frontendUrl);
    res.status(200).json(result);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return handleError(res, 400, "Reset token is required");
    }

    if (password !== confirmPassword) {
      return handleError(res, 400, "Passwords do not match");
    }

    const result = await resetPasswordService(token, password);
    res.status(200).json(result);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const { registerUser, loginUser } = require("../services/usersService");
const { auth } = require("../../auth/authService");

//Routes - handles the HTTP requests and responses. (frontend to backend)

//Register a new user

router.post("/register", async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

//Login a user

router.post("/login", async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    res.status(200).json(user);
  } catch (error) {
    return handleError(res, error.status || 500, error.message);
  }
});

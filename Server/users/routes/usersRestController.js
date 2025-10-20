const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const {
  registerUserService,
  loginUserService,
} = require("../services/usersService");

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

module.exports = router;

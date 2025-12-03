const express = require("express");
const router = express.Router();

const { handleError } = require("../../utils/errorHandler");
const { adminAuth } = require("../../middlewares/adminAuth");
const {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  adminUpdateUsernameService,
  adminResetPasswordService,
  deleteUserService,
} = require("../services/adminUsersService");
const { generalRateLimiter } = require("../../middlewares/rateLimiter");

// Get all users with pagination and search (admin only)
router.get(
  "/users",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const search = req.query.search || "";

      const result = await getAllUsersService(page, pageSize, search);
      res.status(200).json(result);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

// Get user by ID (admin only)
router.get(
  "/users/:id",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await getUserByIdService(id);
      res.status(200).json(user);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

// Update user username (admin only)
router.patch(
  "/users/:id/username",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.body;

      if (!username) {
        return handleError(res, 400, "Username is required");
      }

      const user = await adminUpdateUsernameService(id, username);
      res.status(200).json(user);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

// Update user role (admin only)
router.patch(
  "/users/:id/role",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      if (typeof isAdmin !== "boolean") {
        return handleError(res, 400, "isAdmin must be a boolean");
      }

      const user = await updateUserRoleService(id, isAdmin);
      res.status(200).json(user);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

// Admin-initiated password reset (admin only)
router.post(
  "/users/:id/reset-password",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const frontendUrl = req.headers.origin || "http://localhost:5173";

      const result = await adminResetPasswordService(id, frontendUrl);
      res.status(200).json(result);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

// Delete user (admin only)
router.delete(
  "/users/:id",
  adminAuth,
  generalRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteUserService(id);
      res.status(200).json(result);
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
  }
);

module.exports = router;


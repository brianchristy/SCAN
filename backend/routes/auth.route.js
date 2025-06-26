import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  help,
  getProducts,
  vhelp,
  markHelpCompleted,
  getMe,
  refreshToken,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Routes that need authentication
router.get("/check-auth", verifyToken, checkAuth);

// Route to get all unassigned help requests for volunteers (GET)
router.get("/volunteers", verifyToken, getProducts); // fetches available help requests

// Route for volunteer to accept a help request (POST)
router.post("/volunteers", verifyToken, vhelp); // accepts a specific help request

// User authentication and signup routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Token refresh route
router.post("/refresh-token", refreshToken);

// Profile update route
router.put("/update-profile", verifyToken, updateProfile);

// Citizen help request route
router.post("/citizens", help);
router.post("/mark-help-completed", markHelpCompleted);

// Email verification and password recovery routes
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get('/me', verifyToken, getMe);

export default router;
import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  verifyEmail,
  resetPassword,
  checkAuth,
  help,
  getProducts,
  vhelp,
  markHelpCompleted,
  getMe,
  refreshToken,
  checkExpiredHelpRequests,
  forgotPassword
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

// Route to manually check expired help requests (for testing/admin)
router.post("/check-expired-requests", verifyToken, async (req, res) => {
  try {
    await checkExpiredHelpRequests();
    res.status(200).json({ success: true, message: "Expired requests check completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking expired requests" });
  }
});

// Public route to manually check expired help requests (for testing)
router.post("/check-expired-requests-public", async (req, res) => {
  try {
    await checkExpiredHelpRequests();
    res.status(200).json({ success: true, message: "Expired requests check completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking expired requests" });
  }
});

// Cron job endpoint to keep server awake and check expired requests
router.get("/cron/check-expired", async (req, res) => {
  try {
    await checkExpiredHelpRequests();
    res.status(200).json({ 
      success: true, 
      message: "Cron job executed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error in cron job",
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint for cron services
router.get("/health", async (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "SCAN Backend"
  });
});

export default router;
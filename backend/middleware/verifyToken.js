import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { clearUserSession } from "../utils/generateTokenAndSetCookie.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    let decoded;
    let user;

    // Try to verify the session token
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId);
        
        if (!user) {
          throw new Error("User not found");
        }

        // Check if user is banned
        if (!user.isVerified && !user.verificationToken) {
          await clearUserSession(decoded.userId);
          return res.status(403).json({ 
            success: false, 
            message: "Account suspended",
            isBanned: true 
          });
        }

        // Check if session token matches stored token
        if (user.sessionToken !== token) {
          await clearUserSession(decoded.userId);
          return res.status(401).json({ success: false, message: "Invalid session" });
        }

        // Check if session has expired
        if (user.sessionExpiresAt && new Date() > user.sessionExpiresAt) {
          await clearUserSession(decoded.userId);
          return res.status(401).json({ success: false, message: "Session expired" });
        }

        // Check for inactivity (15 minutes)
        const inactiveTime = Date.now() - user.lastActivity.getTime();
        if (inactiveTime > 15 * 60 * 1000) { // 15 minutes
          await clearUserSession(decoded.userId);
          return res.status(401).json({ success: false, message: "Session expired due to inactivity" });
        }

        // Update last activity
        user.lastActivity = new Date();
        await user.save();

        req.userId = decoded.userId;
        return next();
      } catch (tokenError) {
          return res.status(401).json({ success: false, message: "Invalid token" });
        }
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.category !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

import bcryptjs from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { generateTokenAndSetCookie, clearUserSession } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../models/user.model.js";
import { sendEmail } from '../utils/sendEmail.js';


export const signup = async (req, res) => {
  const { email, password, name, contactno, category, skills, location } =
    req.body;

  try {
    if (!email || !password || !name || !contactno || !category) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    // Generate a secure random token
    const rawToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    if (category === "Citizen") {
      const user = new User({
        email,
        password: hashedPassword,
        name,
        contactno,
        category,
        skills: [],
        location: null,
        verificationToken: tokenHash,
        verificationTokenExpiresAt,
        isVerified: false,
        isApproved: true, // Not used for citizens, but set to true
      });
      await user.save();
      // Send verification email with the raw token
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email for SCAN',
        html: `<p>Hello ${user.name || ''},</p>
          <p>Thank you for signing up for SCAN. Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you did not sign up, you can ignore this email.</p>`
      });
      res.status(201).json({
        success: true,
        message: "User created successfully. Please check your email to verify your account.",
      });
    } else if (category === "Volunteer") {
      const user = new User({
        email,
        password: hashedPassword,
        name,
        contactno,
        category,
        skills,
        location,
        verificationToken: tokenHash,
        verificationTokenExpiresAt,
        isVerified: false, // Volunteers must verify email
        isApproved: false, // Must be approved by admin
      });
      await user.save();
      // Send verification email with the raw token
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email for SCAN',
        html: `<p>Hello ${user.name || ''},</p>
          <p>Thank you for signing up as a volunteer for SCAN. Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you did not sign up, you can ignore this email.</p>`
      });
      res.status(201).json({
        success: true,
        message: "Volunteer registration successful. Please check your email to verify your account.",
      });
    } else {
      throw new Error("Invalid category");
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid or missing verification token." });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: tokenHash,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    // Custom message for volunteers
    if (user.category === "Volunteer") {
      return res.status(200).json({ success: true, message: "Email verified successfully. Your registration is pending admin approval.", pendingApproval: true });
    }
    res.status(200).json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Block banned users (isVerified: false, but not a new user with a token)
    if (!user.isVerified && !user.verificationToken) {
      return res
        .status(403)
        .json({ success: false, message: "This account has been suspended." });
    }

    // Check if volunteer is approved
    if (user.category === 'Volunteer' && !user.isApproved) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is pending admin approval." });
    }

    await generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    user.lastActivity = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear user session from database
    if (req.userId) {
      await clearUserSession(req.userId);
    }
    
    const isProduction = process.env.NODE_ENV === "production";
    
    // Clear cookies with same options as set
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    
  res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Error during logout" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, contactno, skills, location } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (contactno) user.contactno = contactno;

    if (user.category === "Volunteer") {
      if (skills) user.skills = skills;
      if (location) user.location = location;
    }

    // Save user
    await user.save();

    // Send full user details including isVerified
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        contactno: user.contactno,
        skills: user.skills || [],
        location: user.location || null,
        isVerified: user.isVerified, // Ensure isVerified is included
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


export const help = async (req, res) => {
  const { email, helptitle, helpdescription, additional, location, helpdate, helptime, action } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (action === 'request') {
      // Requesting help
      user.helptitle = helptitle;
      user.helpdescription = helpdescription;
      user.additional = additional;
      user.location = location;
      user.helpdate = helpdate;
      user.helptime = helptime;
      user.helpstatus = false; // Set as active request
      user.volunteerDetails = { isAccepted: false }; // Reset volunteer details
    } else if (action === 'cancel') {
      // Canceling help request
      user.helptitle = null;
      user.helpdescription = null;
      user.additional = null;
      user.location = null;
      user.helpdate = null;
      user.helptime = null;
      user.helpstatus = true;
      user.volunteerDetails = {}; // Clear volunteer details
    }

    await user.save();

    // Return the updated user data
    const userData = {
      ...user._doc,
      password: undefined,
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined
    };

    res.status(200).json({
      success: true,
      message: action === 'request' ? "Help request submitted" : "Help request cancelled",
      user: userData
    });
  } catch (error) {
    console.log("Error in help request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const userId = req.userId;

    // Query 1: Get all unaccepted help requests
    const availableRequestsQuery = { 
      category: "Citizen",
      helptitle: { $exists: true, $ne: "" },
      $or: [
        { 'volunteerDetails': { $exists: false } },
        { 'volunteerDetails': null },
        { 'volunteerDetails.isAccepted': { $ne: true } }
      ]
    };
    
    // Query 2: Get the specific request accepted by the current volunteer
    const myAcceptedRequestQuery = {
      'volunteerDetails.volunteerId': new mongoose.Types.ObjectId(userId),
      'volunteerDetails.isAccepted': true
    };

    const availableRequests = await User.find(availableRequestsQuery)
      .select('-password -verificationToken -verificationTokenExpiresAt');
    
    const myAcceptedRequest = await User.find(myAcceptedRequestQuery)
      .select('-password -verificationToken -verificationTokenExpiresAt');

    // Combine the results
    const allProducts = [...availableRequests, ...myAcceptedRequest];
    
    res.status(200).json({ success: true, data: allProducts });
  } catch (error) {
    console.error("Error in fetching products:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching help requests"
    });
  }
};


export const vhelp = async (req, res) => {
  const { email, volunteerName, volunteerContact, volunteerId } = req.body;

  try {
    // Find the senior citizen by email
    const seniorCitizen = await User.findOne({ email });

    if (!seniorCitizen) {
      return res.status(404).json({ success: false, message: "Senior citizen not found" });
    }

    // Check if the help request is still available
    if (!seniorCitizen.helptitle || seniorCitizen.helpstatus === true) {
      return res.status(409).json({ success: false, message: "Help request is no longer available" });
    }

    // Check if the request is already accepted by a volunteer
    if (seniorCitizen.volunteerDetails?.isAccepted) {
      return res.status(400).json({ success: false, message: "Help request already accepted" });
    }

    // Update senior's record with volunteer's details and acceptance
    seniorCitizen.volunteerDetails = {
      name: volunteerName,
      contactno: volunteerContact,
      volunteerId: volunteerId,
      isAccepted: true,
      acceptedAt: new Date()
    };
    seniorCitizen.helpstatus = false; // Mark request as resolved

    await seniorCitizen.save();

    // Find the volunteer and update their assigned request
    if (volunteerId) {
      const volunteer = await User.findById(volunteerId);
      if (volunteer) {
        volunteer.assignedRequest = seniorCitizen._id;
        await volunteer.save();
      }
    }

    // Return the updated senior citizen data
    res.status(200).json({
      success: true,
      message: "Help request accepted",
      seniorCitizen: seniorCitizen
    });
  } catch (error) {
    console.log("Error in vhelp ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markHelpCompleted = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the senior citizen by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Senior citizen not found" });
    }

    // Reset help request status and volunteer details
    user.helptitle = null;
    user.helpdescription = null;
    user.additional = null;
    user.location = null;
    user.helpstatus = true;
    user.volunteerDetails = {}; // Clear volunteer details
    await user.save();

    res.status(200).json({
      success: true,
      message: "Help marked as completed",
    });
  } catch (error) {
    console.log("Error in marking help as completed:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is banned (isVerified: false but not a new user with verification token)
    if (!user.isVerified && !user.verificationToken) {
      return res.status(403).json({ 
        message: 'Account suspended',
        isBanned: true 
      });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is banned
    if (!user.isVerified && !user.verificationToken) {
      await clearUserSession(decoded.userId);
      return res.status(403).json({ 
        success: false, 
        message: 'Account suspended',
        isBanned: true 
      });
    }

    // Generate new tokens
    await generateTokenAndSetCookie(res, decoded.userId);

    res.status(200).json({ 
      success: true, 
      message: 'Token refreshed successfully' 
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

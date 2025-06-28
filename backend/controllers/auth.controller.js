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
      // Validate that requested time is at least 3 hours in the future
      if (helpdate && helptime) {
        try {
          const [year, month, day] = helpdate.split('-').map(Number);
          const [hour, minute] = helptime.split(':').map(Number);
          const requestDate = new Date(year, month - 1, day, hour, minute);
          const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000); // plus 3 hours
          
          if (requestDate < threeHoursFromNow) {
            return res
              .status(400)
              .json({ success: false, message: "Help requests must be scheduled at least 3 hours in advance" });
          }
        } catch (error) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid date or time format" });
        }
      }

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
    const now = new Date();

    // Query 1: Get all unaccepted help requests that are not expired
    const availableRequestsQuery = { 
      category: "Citizen",
      helptitle: { $exists: true, $ne: "" },
      $or: [
        { 'volunteerDetails': { $exists: false } },
        { 'volunteerDetails': null },
        { 'volunteerDetails.isAccepted': { $ne: true } }
      ]
    };
    
    let availableRequests = await User.find(availableRequestsQuery)
      .select('-password -verificationToken -verificationTokenExpiresAt');

    // Filter out requests whose requested time is in the past
    availableRequests = availableRequests.filter(req => {
      if (!req.helpdate || !req.helptime) return false;
      try {
        const [year, month, day] = req.helpdate.split('-').map(Number);
        const [hour, minute] = req.helptime.split(':').map(Number);
        const requestDate = new Date(year, month - 1, day, hour, minute);
        return requestDate >= now;
      } catch {
        return false;
      }
    });
    
    // Query 2: Get the specific request accepted by the current volunteer
    const myAcceptedRequestQuery = {
      'volunteerDetails.volunteerId': new mongoose.Types.ObjectId(userId),
      'volunteerDetails.isAccepted': true
    };
    
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

    // Generate a 6-digit completion code
    const completionCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update senior's record with volunteer's details and acceptance
    seniorCitizen.volunteerDetails = {
      name: volunteerName,
      contactno: volunteerContact,
      volunteerId: volunteerId,
      isAccepted: true,
      acceptedAt: new Date(),
      completionCode: completionCode
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

    // Send email to the citizen notifying them that a volunteer has accepted their request
    try {
      await sendEmail({
        to: seniorCitizen.email,
        subject: 'A Volunteer Has Accepted Your Request',
        html: `<p>Hello ${seniorCitizen.name || ''},</p>
          <p>Good news! A volunteer has accepted your help request on SCAN.</p>
          <p><strong>Volunteer Name:</strong> ${volunteerName}</p>
          <p><strong>Contact Number:</strong> ${volunteerContact}</p>
          <p>The volunteer will reach out to you soon. You can also contact them directly if needed.</p>
          <p><strong>Your Completion Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #4f46e5;">${completionCode}</span></p>
          <p>Please provide this code to the volunteer when they complete your request. This code is required for the volunteer to mark your request as completed.</p>
          <p><a href="${process.env.CLIENT_URL}/login" style="color: #4f46e5; text-decoration: underline;">Log in to your SCAN account</a> to view your request status and more details.</p>
          <p>Thank you for using SCAN!</p>`
      });
    } catch (emailError) {
      console.error('Failed to send acceptance email to citizen:', emailError);
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
  const { email, completionCode, isAdmin } = req.body;

  try {
    // Find the senior citizen by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Senior citizen not found" });
    }

    // If not admin, verify completion code
    if (!isAdmin) {
      if (!completionCode) {
        return res
          .status(400)
          .json({ success: false, message: "Completion code is required" });
      }

      // Check if the completion code matches
      if (user.volunteerDetails?.completionCode !== completionCode) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid completion code" });
      }
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

export const checkExpiredHelpRequests = async () => {
  try {
    const now = new Date();
    
    // Find all active help requests that have expired (past their requested time)
    const expiredRequests = await User.find({
      category: 'Citizen',
      helptitle: { $exists: true, $ne: null },
      helpstatus: false, // Active requests
      $or: [
        { 'volunteerDetails': { $exists: false } },
        { 'volunteerDetails': null },
        { 'volunteerDetails.isAccepted': { $ne: true } }
      ]
    });

    for (const request of expiredRequests) {
      if (request.helpdate && request.helptime) {
        try {
          // Parse the requested date and time
          const [year, month, day] = request.helpdate.split('-').map(Number);
          const [hour, minute] = request.helptime.split(':').map(Number);
          const requestDateTime = new Date(year, month - 1, day, hour, minute);
          
          // Check if the request time has passed
          if (requestDateTime < now) {
            // Send email notification to citizen
            try {
              await sendEmail({
                to: request.email,
                subject: 'No Volunteers Available for Your Help Request',
                html: `<p>Hello ${request.name || ''},</p>
                  <p>We regret to inform you that no volunteers were available to accept your help request for <strong>${request.helptitle}</strong> scheduled for ${request.helpdate} at ${request.helptime}.</p>
                  <p>Your request has now expired. You can submit a new help request if you still need assistance.</p>
                  <p><strong>Request Details:</strong></p>
                  <ul>
                    <li>Type of Help: ${request.helptitle}</li>
                    <li>Description: ${request.helpdescription}</li>
                    <li>Location: ${request.location}</li>
                    <li>Date: ${request.helpdate}</li>
                    <li>Time: ${request.helptime}</li>
                  </ul>
                  <p><a href="${process.env.CLIENT_URL}/login" style="color: #4f46e5; text-decoration: underline;">Log in to your SCAN account</a> to submit a new request.</p>
                  <p>Thank you for using SCAN!</p>`
              });
            } catch (emailError) {
              console.error('Failed to send expiration email to citizen:', emailError);
            }

            // Clear the expired request
            request.helptitle = null;
            request.helpdescription = null;
            request.additional = null;
            request.location = null;
            request.helpdate = null;
            request.helptime = null;
            request.helpstatus = true;
            request.volunteerDetails = {};
            
            await request.save();
            console.log(`Expired help request cleared for user: ${request.email}`);
          }
        } catch (parseError) {
          console.error('Error parsing date/time for request:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Error checking expired help requests:', error);
  }
};

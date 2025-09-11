import bcryptjs from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

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
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
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
          <p><a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
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
          <p><a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
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
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No account found with this email" });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        message: "Your account has been suspended by an administrator",
        isBanned: true 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate tokens (not cookies)
    const { sessionToken, refreshToken } = await generateTokenAndSetCookie(res, user._id);

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contactno: user.contactno,
      category: user.category,
      isVerified: user.isVerified,
      isBanned: user.isBanned,
      helptitle: user.helptitle,
      helpdescription: user.helpdescription,
      additional: user.additional,
      location: user.location,
      helpdate: user.helpdate,
      helptime: user.helptime,
      helpstatus: user.helpstatus,
      volunteerDetails: user.volunteerDetails,
      skills: user.skills,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      sessionToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear user session from database
    if (req.userId) {
      await clearUserSession(req.userId);
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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

    // Send full user details including isVerified and category
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactno: user.contactno,
        category: user.category,
        skills: user.skills || [],
        location: user.location || null,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        helptitle: user.helptitle,
        helpdescription: user.helpdescription,
        additional: user.additional,
        helpdate: user.helpdate,
        helptime: user.helptime,
        helpstatus: user.helpstatus,
        volunteerDetails: user.volunteerDetails,
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


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    // Hash the token for lookup
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 12);
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const help = async (req, res) => {
  try {
    const { email, helptitle, helpdescription, additional, location, helpdate, helptime, action } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "request") {
      // Create new help request
      user.helptitle = helptitle;
      user.helpdescription = helpdescription;
      user.additional = additional;
      user.location = location;
      user.helpdate = helpdate;
      user.helptime = helptime;
      user.helpstatus = false; // Active request
      user.volunteerDetails = null; // Clear any previous volunteer details
    } else if (action === "cancel") {
      // Only enforce 2-hour rule if a volunteer is assigned and accepted
      if (user.volunteerDetails && user.volunteerDetails.isAccepted) {
        if (user.helpdate && user.helptime) {
          try {
            const requestDate = dayjs.tz(`${user.helpdate} ${user.helptime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
            const cutoff = requestDate.subtract(2, 'hour');
            const now = dayjs().tz('Asia/Kolkata');
            if (now.isAfter(cutoff)) {
              return res.status(400).json({ message: "You can only cancel the request up to 2 hours before the requested time after a volunteer is assigned." });
            }
          } catch {
            // If parsing fails, allow cancel
          }
        }
      }
      // Cancel help request
      user.helptitle = null;
      user.helpdescription = null;
      user.additional = null;
      user.location = null;
      user.helpdate = null;
      user.helptime = null;
      user.helpstatus = null;
      user.volunteerDetails = null;
    }

    await user.save();

    // Return updated user data
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contactno: user.contactno,
      category: user.category,
      isVerified: user.isVerified,
      isBanned: user.isBanned,
      helptitle: user.helptitle,
      helpdescription: user.helpdescription,
      additional: user.additional,
      location: user.location,
      helpdate: user.helpdate,
      helptime: user.helptime,
      helpstatus: user.helpstatus,
      volunteerDetails: user.volunteerDetails,
      skills: user.skills,
    };

    res.status(200).json({
      message: action === "request" ? "Help request submitted successfully" : "Help request cancelled successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing help request" });
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
      'volunteerDetails.isAccepted': true,
      'helpstatus': false // Only return if not completed!
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
  try {
    const { email, volunteerName, volunteerContact, volunteerId } = req.body;

    const seniorCitizen = await User.findOne({ email });
    if (!seniorCitizen) {
      return res.status(404).json({ message: "Help request not found" });
    }

    // Check if request is already accepted
    if (seniorCitizen.volunteerDetails && seniorCitizen.volunteerDetails.isAccepted) {
      return res.status(400).json({ message: "This help request has already been accepted by another volunteer" });
    }

    // Generate 6-digit completion code
    const completionCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the help request with volunteer details
    seniorCitizen.volunteerDetails = {
      name: volunteerName,
      contactno: volunteerContact,
      volunteerId: volunteerId,
      isAccepted: true,
      acceptedAt: new Date(),
      completionCode: completionCode
    };

    await seniorCitizen.save();

    // Send email to citizen with volunteer details and completion code
    const emailHtml = `
      <h2>Your Help Request Has Been Accepted!</h2>
      <p>Great news! A volunteer has accepted your help request.</p>
      
      <h3>Volunteer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${volunteerName}</li>
        <li><strong>Contact:</strong> ${volunteerContact}</li>
      </ul>
      
      <h3>Your Completion Code:</h3>
      <p style="font-size: 24px; font-weight: bold; color: #4F46E5; background-color: #f3f4f6; padding: 10px; border-radius: 5px; text-align: center;">${completionCode}</p>
      <p><em>Please provide this code to the volunteer when they complete your help request.</em></p>
      
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Help Type:</strong> ${seniorCitizen.helptitle}</li>
        <li><strong>Date:</strong> ${seniorCitizen.helpdate}</li>
        <li><strong>Time:</strong> ${seniorCitizen.helptime}</li>
        <li><strong>Location:</strong> ${seniorCitizen.location}</li>
      </ul>
      
      <p>You can log in to your account to view more details: <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to SCAN</a></p>
      
      <p>Thank you for using SCAN!</p>
    `;

    await sendEmail({
      to: email,
      subject: "Help Request Accepted - SCAN",
      html: emailHtml,
    });

    // Return updated user data
    const userResponse = {
      _id: seniorCitizen._id,
      name: seniorCitizen.name,
      email: seniorCitizen.email,
      contactno: seniorCitizen.contactno,
      category: seniorCitizen.category,
      isVerified: seniorCitizen.isVerified,
      isBanned: seniorCitizen.isBanned,
      helptitle: seniorCitizen.helptitle,
      helpdescription: seniorCitizen.helpdescription,
      additional: seniorCitizen.additional,
      location: seniorCitizen.location,
      helpdate: seniorCitizen.helpdate,
      helptime: seniorCitizen.helptime,
      helpstatus: seniorCitizen.helpstatus,
      volunteerDetails: seniorCitizen.volunteerDetails,
      skills: seniorCitizen.skills,
    };

    res.status(200).json({
      message: "Help request accepted successfully",
      seniorCitizen: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting help request" });
  }
};

export const markHelpCompleted = async (req, res) => {
  try {
    const { email, completionCode, isAdmin } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if there's an active help request
    if (!user.helptitle || user.helpstatus) {
      return res.status(400).json({ message: "No active help request found" });
    }

    // Check if volunteer is assigned
    if (!user.volunteerDetails || !user.volunteerDetails.isAccepted) {
      return res.status(400).json({ message: "No volunteer assigned to this request" });
    }

    // Verify completion code (skip for admin)
    if (!isAdmin && user.volunteerDetails.completionCode !== completionCode) {
      return res.status(400).json({ message: "Invalid completion code" });
    }

    // Mark help as completed
    user.helpstatus = true;
    user.volunteerDetails.completedAt = new Date();
    await user.save();

    // Send completion email to citizen
    const emailHtml = `
      <h2>Help Request Completed!</h2>
      <p>Your help request has been marked as completed.</p>
      
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Help Type:</strong> ${user.helptitle}</li>
        <li><strong>Date:</strong> ${user.helpdate}</li>
        <li><strong>Time:</strong> ${user.helptime}</li>
        <li><strong>Location:</strong> ${user.location}</li>
        <li><strong>Completed At:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      
      <p>Thank you for using SCAN! We hope you received the help you needed.</p>
      
      <p>You can log in to your account to request more help: <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to SCAN</a></p>
    `;

    await sendEmail({
      to: email,
      subject: "Help Request Completed - SCAN",
      html: emailHtml,
    });

    res.status(200).json({ message: "Help request marked as completed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error marking help as completed" });
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
    const { refreshToken } = req.body;
    
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
    const { sessionToken, refreshToken: newRefreshToken } = await generateTokenAndSetCookie(res, decoded.userId);

    res.status(200).json({ 
      success: true, 
      message: 'Token refreshed successfully',
      sessionToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No such user exists" });
    }
    // Generate reset token and expiry
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();
    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    const emailHtml = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your SCAN account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendEmail({
      to: email,
      subject: "Password Reset Request - SCAN",
      html: emailHtml,
    });
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset password email" });
  }
};

// Helper to convert a Date object to IST (UTC+5:30)
function toIST(date) {
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
}

export const checkExpiredHelpRequests = async () => {
  try {
    const nowUTC = new Date();
    const nowIST = toIST(nowUTC);
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
          const requestDateTimeIST = dayjs.tz(`${request.helpdate} ${request.helptime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
          const nowIST = dayjs().tz('Asia/Kolkata');
          // Check if the request has expired (past the requested time in IST)
          if (nowIST.isAfter(requestDateTimeIST)) {
            // Send email notification to citizen
            const emailHtml = `
              <h2>Help Request Expired</h2>
              <p>Your help request has expired without being accepted by a volunteer.</p>
              <h3>Request Details:</h3>
              <ul>
                <li><strong>Help Type:</strong> ${request.helptitle}</li>
                <li><strong>Date:</strong> ${request.helpdate}</li>
                <li><strong>Time:</strong> ${request.helptime}</li>
                <li><strong>Location:</strong> ${request.location}</li>
              </ul>
              <p>You can create a new help request at any time: <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to SCAN</a></p>
              <p>Thank you for using SCAN!</p>
            `;
            await sendEmail({
              to: request.email,
              subject: "Help Request Expired - SCAN",
              html: emailHtml,
            });
            // Clear the expired request
            request.helptitle = null;
            request.helpdescription = null;
            request.additional = null;
            request.location = null;
            request.helpdate = null;
            request.helptime = null;
            request.helpstatus = null;
            request.volunteerDetails = null;
            await request.save();
          }
        } catch (parseError) {
          console.error('[CRON] Error parsing date or clearing request for', request.email, parseError);
        }
      }
    }
  } catch (error) {
    console.error('[CRON] Error in checkExpiredHelpRequests:', error);
  }
};

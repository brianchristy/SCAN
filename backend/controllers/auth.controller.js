import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";


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
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      contactno,
      category,
      skills: category === "Volunteer" ? skills : [], // Save skills for Volunteer
      location: category === "Volunteer" ? location : null, // Save location for Volunteer
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
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

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
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
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
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
  const { email, helptitle, helpdescription, additional, location } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.helpstatus) {
      // Requesting help, set help details
      user.helptitle = helptitle;
      user.helpdescription = helpdescription;
      user.additional = additional;
      user.location = location;
      user.helpstatus = false; // Set as active request
      user.volunteerDetails = { isAccepted: false }; // Reset volunteer details
    } else {
      // Cancel the help request
      user.helptitle = null;
      user.helpdescription = null;
      user.additional = null;
      user.location = null;
      user.helpstatus = true;
      user.volunteerDetails = {}; // Clear volunteer details
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Help request updated",
      helpstatus: user.helpstatus,
      volunteerDetails: user.volunteerDetails
    });
  } catch (error) {
    console.log("Error in help request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await User.find({ category: "Senior Citizen" });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("error in fetching products:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const vhelp = async (req, res) => {
  const { email, volunteerName, volunteerContact } = req.body;

  try {
    // Find the senior citizen by email
    const seniorCitizen = await User.findOne({ email });

    if (!seniorCitizen) {
      return res.status(404).json({ success: false, message: "Senior citizen not found" });
    }

    // Check if the request is already accepted by a volunteer
    if (seniorCitizen.volunteerDetails.isAccepted) {
      return res.status(400).json({ success: false, message: "Help request already accepted" });
    }

    // Update senior's record with volunteer's details and acceptance
    seniorCitizen.volunteerDetails = {
      name: volunteerName,
      contactno: volunteerContact,
      isAccepted: true
    };
    seniorCitizen.helpstatus = false; // Mark request as resolved

    await seniorCitizen.save();

    res.status(200).json({
      success: true,
      message: "Help request accepted",
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

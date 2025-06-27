import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const generateTokenAndSetCookie = async (res, userId) => {
	// Generate a unique session token
	const sessionToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15m", // 15 minutes for session token
	});

	// Generate a refresh token for longer sessions
	const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d", // 7 days for refresh token
	});

	// Update user's session info in database
	await User.findByIdAndUpdate(userId, {
		sessionToken: sessionToken,
		sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
		lastActivity: new Date(),
	});

	// Set session token as httpOnly cookie (15 minutes)
	res.cookie("token", sessionToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "none",
		path: "/",
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	// Set refresh token as httpOnly cookie (7 days)
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "none",
		path: "/",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});

	return { sessionToken, refreshToken };
};

export const clearUserSession = async (userId) => {
	if (userId) {
		await User.findByIdAndUpdate(userId, {
			sessionToken: null,
			sessionExpiresAt: null,
		});
	}
};

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

	// Return tokens to be stored in sessionStorage (cleared when browser closes)
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

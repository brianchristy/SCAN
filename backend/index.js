import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import { checkExpiredHelpRequests } from './controllers/auth.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
// Allow both local and deployed frontend for CORS
app.use(cors({
	origin: [
		"http://localhost:5173",
		"https://scan-app.onrender.com"
	],
	credentials: true
}));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Schedule job to check for expired help requests every 5 minutes
setInterval(async () => {
	console.log('Checking for expired help requests...');
	await checkExpiredHelpRequests();
}, 5 * 60 * 1000); // 5 minutes

// Also run once on server startup
checkExpiredHelpRequests();

app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});

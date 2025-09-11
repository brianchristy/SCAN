import express from "express";
import {
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getAllUsers,
  deleteUser,
  getAllHelps,
  completeHelp,
  cancelHelp,
  banUser,
  unbanUser,
  getBannedUsers
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/volunteers/pending", verifyToken, getPendingVolunteers);
router.patch("/volunteers/:id/approve", verifyToken, approveVolunteer);
router.delete("/volunteers/:id", verifyToken, rejectVolunteer);

router.get("/users", verifyToken, getAllUsers);
router.delete("/users/:id", verifyToken, deleteUser);

router.get("/users/banned", verifyToken, getBannedUsers);
router.patch("/users/:id/ban", verifyToken, banUser);
router.patch("/users/:id/unban", verifyToken, unbanUser);

router.get("/helps", verifyToken, getAllHelps);
router.patch("/helps/:id/complete", verifyToken, completeHelp);
router.patch("/helps/:id/cancel", verifyToken, cancelHelp);

export default router; 
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
import { verifyToken, requireAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/volunteers/pending", verifyToken, requireAdmin, getPendingVolunteers);
router.patch("/volunteers/:id/approve", verifyToken, requireAdmin, approveVolunteer);
router.delete("/volunteers/:id", verifyToken, requireAdmin, rejectVolunteer);

router.get("/users", verifyToken, requireAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

router.get("/users/banned", verifyToken, requireAdmin, getBannedUsers);
router.patch("/users/:id/ban", verifyToken, requireAdmin, banUser);
router.patch("/users/:id/unban", verifyToken, requireAdmin, unbanUser);

router.get("/helps", verifyToken, requireAdmin, getAllHelps);
router.patch("/helps/:id/complete", verifyToken, requireAdmin, completeHelp);
router.patch("/helps/:id/cancel", verifyToken, requireAdmin, cancelHelp);

export default router; 
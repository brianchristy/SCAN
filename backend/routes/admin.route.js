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

const router = express.Router();

router.get("/volunteers/pending", getPendingVolunteers);
router.patch("/volunteers/:id/approve", approveVolunteer);
router.delete("/volunteers/:id", rejectVolunteer);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/users/banned", getBannedUsers);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

router.get("/helps", getAllHelps);
router.patch("/helps/:id/complete", completeHelp);
router.patch("/helps/:id/cancel", cancelHelp);

export default router; 
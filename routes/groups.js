import express from "express"
import {
  createGroup,
  getPublicGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  updateGroup,
  addModerator,
  removeModerator,
} from "../controllers/groupController.js"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/", authenticateToken, createGroup)
router.get("/", getPublicGroups)
router.get("/:groupId", optionalAuth, getGroupDetails)
router.post("/:groupId/join", authenticateToken, joinGroup)
router.post("/:groupId/leave", authenticateToken, leaveGroup)
router.put("/:groupId", authenticateToken, updateGroup)
router.post("/:groupId/moderators", authenticateToken, addModerator)
router.delete("/:groupId/moderators/:userId", authenticateToken, removeModerator)

export default router

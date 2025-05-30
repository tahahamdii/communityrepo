import express from "express"
import {
  moderateContent,
  getFlaggedContent,
  approveContent,
  deleteContent,
  reportContent,
} from "../controllers/moderationController.js"
import { authenticateToken, requireModerator } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/moderate", moderateContent)
router.get("/flagged", authenticateToken, requireModerator, getFlaggedContent)
router.post("/approve", authenticateToken, requireModerator, approveContent)
router.post("/delete", authenticateToken, requireModerator, deleteContent)
router.post("/report", authenticateToken, reportContent)

export default router

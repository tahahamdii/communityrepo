import express from "express"
import {
  getUserProfile,
  updateUserProfile,
  addFavoriteTeam,
  removeFavoriteTeam,
  getUserActivity,
  awardPoints,
} from "../controllers/userController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/:username", getUserProfile)
router.put("/profile", authenticateToken, updateUserProfile)
router.post("/favorite-teams", authenticateToken, addFavoriteTeam)
router.delete("/favorite-teams/:groupId", authenticateToken, removeFavoriteTeam)
router.get("/:username/activity", getUserActivity)
router.post("/:userId/award-points", authenticateToken, requireAdmin, awardPoints)

export default router

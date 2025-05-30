import express from "express"
import { getGlobalRankings, getGroupRankings, getUserLevel } from "../controllers/rankingController.js"
import { optionalAuth, authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/global", optionalAuth, getGlobalRankings)
router.get("/group/:groupId", optionalAuth, getGroupRankings)
router.get("/level", authenticateToken, getUserLevel)

export default router

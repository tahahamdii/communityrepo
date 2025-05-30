import express from "express"
import {
  createPoll,
  getActivePolls,
  getGroupPolls,
  getPoll,
  voteOnPoll,
  endPoll,
} from "../controllers/pollController.js"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/", authenticateToken, createPoll)
router.get("/", optionalAuth, getActivePolls)
router.get("/group/:groupId", optionalAuth, getGroupPolls)
router.get("/:pollId", optionalAuth, getPoll)
router.post("/:pollId/vote", authenticateToken, voteOnPoll)
router.post("/:pollId/end", authenticateToken, endPoll)

export default router

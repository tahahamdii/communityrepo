import express from "express"
import { search, searchUsers, searchGroups, searchPosts } from "../controllers/searchController.js"
import { optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.get("/", optionalAuth, search)
router.get("/users", optionalAuth, searchUsers)
router.get("/groups", optionalAuth, searchGroups)
router.get("/posts", optionalAuth, searchPosts)

export default router

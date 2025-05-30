import express from "express"
import {
  createPost,
  getFeedPosts,
  getGroupPosts,
  getPost,
  reactToPost,
  deletePost,
  addComment,
  getCommentReplies,
} from "../controllers/postController.js"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Routes
router.post("/", authenticateToken, createPost)
router.get("/feed", authenticateToken, getFeedPosts)
router.get("/group/:groupId", optionalAuth, getGroupPosts)
router.get("/:postId", optionalAuth, getPost)
router.post("/:postId/react", authenticateToken, reactToPost)
router.delete("/:postId", authenticateToken, deletePost)
router.post("/:postId/comments", authenticateToken, addComment)
router.get("/comments/:commentId/replies", getCommentReplies)

export default router

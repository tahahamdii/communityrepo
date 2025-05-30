import Post from "../models/Post.js"
import Comment from "../models/Comment.js"
import ChatMessage from "../models/ChatMessage.js"
import User from "../models/User.js"

// Moderate content using AI (placeholder for actual AI integration)
export const moderateContent = async (req, res, next) => {
  try {
    const { content, type } = req.body // type: 'post', 'comment', 'chat'

    if (!content || !type) {
      return res.status(400).json({ message: "Content and type are required" })
    }

    // Placeholder for AI moderation logic
    // In a real implementation, you would integrate with services like:
    // - Google Perspective API
    // - OpenAI Moderation API
    // - Custom ML models

    const moderationScore = calculateModerationScore(content)
    const isModerated = moderationScore > 0.7

    res.status(200).json({
      isModerated,
      moderationScore,
      reason: isModerated ? "Content flagged for review" : "Content approved",
    })
  } catch (error) {
    next(error)
  }
}

// Get flagged content for moderators
export const getFlaggedContent = async (req, res, next) => {
  try {
    const { type } = req.query // 'posts', 'comments', 'chat'
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if user is a moderator or admin
    if (!req.user.isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Moderator privileges required." })
    }

    let results = []
    let total = 0

    switch (type) {
      case "posts":
        results = await Post.find({ isModerated: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("author", "username profilePicture")
          .populate("group", "name")

        total = await Post.countDocuments({ isModerated: true })
        break

      case "comments":
        results = await Comment.find({ isModerated: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("author", "username profilePicture")
          .populate("post", "content")

        total = await Comment.countDocuments({ isModerated: true })
        break

      case "chat":
        results = await ChatMessage.find({ isModerated: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("sender", "username profilePicture")
          .populate("group", "name")

        total = await ChatMessage.countDocuments({ isModerated: true })
        break

      default:
        return res.status(400).json({ message: "Invalid content type" })
    }

    res.status(200).json({
      content: results,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Approve flagged content
export const approveContent = async (req, res, next) => {
  try {
    const { contentId, type } = req.body

    // Check if user is a moderator or admin
    if (!req.user.isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Moderator privileges required." })
    }

    let Model
    switch (type) {
      case "post":
        Model = Post
        break
      case "comment":
        Model = Comment
        break
      case "chat":
        Model = ChatMessage
        break
      default:
        return res.status(400).json({ message: "Invalid content type" })
    }

    const content = await Model.findByIdAndUpdate(contentId, { isModerated: false, moderationScore: 0 }, { new: true })

    if (!content) {
      return res.status(404).json({ message: "Content not found" })
    }

    res.status(200).json({
      message: "Content approved successfully",
      content,
    })
  } catch (error) {
    next(error)
  }
}

// Delete flagged content
export const deleteContent = async (req, res, next) => {
  try {
    const { contentId, type } = req.body

    // Check if user is a moderator or admin
    if (!req.user.isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Moderator privileges required." })
    }

    let Model
    switch (type) {
      case "post":
        Model = Post
        // Also delete associated comments
        await Comment.deleteMany({ post: contentId })
        break
      case "comment":
        Model = Comment
        break
      case "chat":
        Model = ChatMessage
        break
      default:
        return res.status(400).json({ message: "Invalid content type" })
    }

    const content = await Model.findByIdAndDelete(contentId)

    if (!content) {
      return res.status(404).json({ message: "Content not found" })
    }

    res.status(200).json({
      message: "Content deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to calculate moderation score
function calculateModerationScore(content) {
  // Simple keyword-based moderation (replace with actual AI service)
  const toxicKeywords = ["spam", "hate", "toxic", "abuse", "harassment"]
  const lowerContent = content.toLowerCase()

  let score = 0
  for (const keyword of toxicKeywords) {
    if (lowerContent.includes(keyword)) {
      score += 0.3
    }
  }

  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7) {
    score += 0.2
  }

  // Check for repeated characters
  if (/(.)\1{4,}/.test(content)) {
    score += 0.2
  }

  return Math.min(score, 1)
}

// Report content
export const reportContent = async (req, res, next) => {
  try {
    const { contentId, type, reason } = req.body
    const userId = req.user.id

    if (!contentId || !type || !reason) {
      return res.status(400).json({ message: "Content ID, type, and reason are required" })
    }

    let Model
    switch (type) {
      case "post":
        Model = Post
        break
      case "comment":
        Model = Comment
        break
      case "chat":
        Model = ChatMessage
        break
      default:
        return res.status(400).json({ message: "Invalid content type" })
    }

    const content = await Model.findById(contentId)
    if (!content) {
      return res.status(404).json({ message: "Content not found" })
    }

    // Mark content for moderation
    content.isModerated = true
    content.moderationScore = Math.max(content.moderationScore || 0, 0.8)
    await content.save()

    // Award points to user for reporting
    await User.findByIdAndUpdate(userId, { $inc: { points: 1 } })

    res.status(200).json({
      message: "Content reported successfully",
    })
  } catch (error) {
    next(error)
  }
}

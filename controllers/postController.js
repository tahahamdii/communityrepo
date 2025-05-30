import Post from "../models/Post.js"
import Comment from "../models/Comment.js"
import User from "../models/User.js"
import Group from "../models/Group.js"

// Create a new post
export const createPost = async (req, res, next) => {
  try {
    const { content, images, links, groupId, tags } = req.body
    const userId = req.user.id

    // Validate group if provided
    if (groupId) {
      const group = await Group.findById(groupId)
      if (!group) {
        return res.status(404).json({ message: "Group not found" })
      }

      // Check if user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "You must be a member of this group to post" })
      }
    }

    const newPost = new Post({
      author: userId,
      content,
      images: images || [],
      links: links || [],
      group: groupId || null,
      tags: tags || [],
    })

    await newPost.save()

    // Populate author and group information
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    // Award points to user for creating a post
    await User.findByIdAndUpdate(userId, { $inc: { points: 5 } })

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    })
  } catch (error) {
    next(error)
  }
}

// Get posts for feed
export const getFeedPosts = async (req, res, next) => {
  try {
    const userId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get user's favorite teams
    const user = await User.findById(userId)
    const favoriteTeams = user.favoriteTeams || []

    // Get posts from favorite teams and general posts
    const posts = await Post.find({
      $or: [{ group: { $in: favoriteTeams } }, { group: null }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    const totalPosts = await Post.countDocuments({
      $or: [{ group: { $in: favoriteTeams } }, { group: null }],
    })

    res.status(200).json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        pages: Math.ceil(totalPosts / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get posts for a specific group
export const getGroupPosts = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Check if group exists
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // If group is private, check if user is a member
    if (group.isPrivate) {
      const userId = req.user.id
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "You must be a member to view posts in this group" })
      }
    }

    const posts = await Post.find({ group: groupId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    const totalPosts = await Post.countDocuments({ group: groupId })

    res.status(200).json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        pages: Math.ceil(totalPosts / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get a single post with comments
export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params

    const post = await Post.findById(postId)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Get comments for the post
    const comments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")

    res.status(200).json({
      post,
      comments,
    })
  } catch (error) {
    next(error)
  }
}

// Add reaction to post
export const reactToPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const { reaction } = req.body // 'like' or 'share'
    const userId = req.user.id

    if (!["like", "share"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction type" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const reactionField = `reactions.${reaction}s`
    const hasReacted = post.reactions[`${reaction}s`].includes(userId)

    let update
    if (hasReacted) {
      // Remove reaction
      update = { $pull: { [reactionField]: userId } }
    } else {
      // Add reaction
      update = { $addToSet: { [reactionField]: userId } }

      // Award points to post author for receiving a reaction
      if (post.author.toString() !== userId) {
        await User.findByIdAndUpdate(post.author, { $inc: { points: 1 } })
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true })
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    res.status(200).json({
      message: hasReacted ? `${reaction} removed` : `${reaction} added`,
      post: updatedPost,
    })
  } catch (error) {
    next(error)
  }
}

// Delete a post
export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this post" })
    }

    // Delete post and its comments
    await Post.findByIdAndDelete(postId)
    await Comment.deleteMany({ post: postId })

    res.status(200).json({ message: "Post deleted successfully" })
  } catch (error) {
    next(error)
  }
}

// Add comment to post
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params
    const { content, parentCommentId } = req.body
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if parent comment exists if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (!parentComment || parentComment.post.toString() !== postId) {
        return res.status(404).json({ message: "Parent comment not found" })
      }
    }

    const newComment = new Comment({
      post: postId,
      author: userId,
      content,
      parentComment: parentCommentId || null,
    })

    await newComment.save()

    // Increment comments count on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })

    // Award points to user for commenting
    await User.findByIdAndUpdate(userId, { $inc: { points: 2 } })

    // Populate author information
    const populatedComment = await Comment.findById(newComment._id).populate("author", "username profilePicture")

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    })
  } catch (error) {
    next(error)
  }
}

// Get replies to a comment
export const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    const replies = await Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .populate("author", "username profilePicture")

    res.status(200).json({ replies })
  } catch (error) {
    next(error)
  }
}

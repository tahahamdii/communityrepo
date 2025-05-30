import User from "../models/User.js"
import Post from "../models/Post.js"
import Group from "../models/Group.js"

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params

    const user = await User.findOne({ username }).select("-password").populate("favoriteTeams", "name logo")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
}

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { bio, profilePicture, favoriteSports } = req.body

    // Prevent updating sensitive fields
    const updateData = {}
    if (bio !== undefined) updateData.bio = bio
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (favoriteSports !== undefined) updateData.favoriteSports = favoriteSports

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

// Add favorite team
export const addFavoriteTeam = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { groupId } = req.body

    // Check if group exists
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Add to favorite teams if not already added
    const user = await User.findByIdAndUpdate(userId, { $addToSet: { favoriteTeams: groupId } }, { new: true }).select(
      "-password",
    )

    res.status(200).json({
      message: "Favorite team added successfully",
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Remove favorite team
export const removeFavoriteTeam = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { groupId } = req.params

    const user = await User.findByIdAndUpdate(userId, { $pull: { favoriteTeams: groupId } }, { new: true }).select(
      "-password",
    )

    res.status(200).json({
      message: "Favorite team removed successfully",
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Get user activity (posts, comments)
export const getUserActivity = async (req, res, next) => {
  try {
    const { username } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    const totalPosts = await Post.countDocuments({ author: user._id })

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

// Award points to user
export const awardPoints = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { points, reason } = req.body

    // Only admins can award points
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to award points" })
    }

    const user = await User.findByIdAndUpdate(userId, { $inc: { points } }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update level based on points
    const newLevel = Math.floor(user.points / 100) + 1
    if (newLevel > user.level) {
      user.level = newLevel
      await user.save()
    }

    res.status(200).json({
      message: `${points} points awarded to user`,
      user,
    })
  } catch (error) {
    next(error)
  }
}

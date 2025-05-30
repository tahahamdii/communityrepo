import User from "../models/User.js"
import Group from "../models/Group.js"

// Get global user rankings
export const getGlobalRankings = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find()
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit)
      .select("username profilePicture points level")

    const totalUsers = await User.countDocuments()

    // If user is authenticated, get their rank
    let userRank = null
    if (req.user) {
      const userId = req.user.id
      const currentUser = await User.findById(userId)

      if (currentUser) {
        const usersWithMorePoints = await User.countDocuments({
          points: { $gt: currentUser.points },
        })
        userRank = usersWithMorePoints + 1
      }
    }

    res.status(200).json({
      rankings: users,
      userRank,
      pagination: {
        total: totalUsers,
        page,
        pages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get group rankings
export const getGroupRankings = async (req, res, next) => {
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
    if (group.isPrivate && req.user) {
      const userId = req.user.id
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "You must be a member to view rankings in this group" })
      }
    }

    // Get members of the group with their points
    const members = await User.find({ _id: { $in: group.members } })
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit)
      .select("username profilePicture points level")

    // If user is authenticated and a member, get their rank
    let userRank = null
    if (req.user) {
      const userId = req.user.id
      if (group.members.includes(userId)) {
        const currentUser = await User.findById(userId)

        if (currentUser) {
          const membersWithMorePoints = await User.countDocuments({
            _id: { $in: group.members },
            points: { $gt: currentUser.points },
          })
          userRank = membersWithMorePoints + 1
        }
      }
    }

    res.status(200).json({
      rankings: members,
      userRank,
      pagination: {
        total: group.members.length,
        page,
        pages: Math.ceil(group.members.length / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get user level information
export const getUserLevel = async (req, res, next) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId).select("points level")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Calculate progress to next level
    const currentLevelPoints = (user.level - 1) * 100
    const nextLevelPoints = user.level * 100
    const pointsInCurrentLevel = user.points - currentLevelPoints
    const progressToNextLevel = Math.floor((pointsInCurrentLevel / 100) * 100)

    res.status(200).json({
      level: user.level,
      points: user.points,
      pointsToNextLevel: nextLevelPoints - user.points,
      progressPercentage: progressToNextLevel,
    })
  } catch (error) {
    next(error)
  }
}

import Poll from "../models/Poll.js"
import Group from "../models/Group.js"
import User from "../models/User.js"

// Create a new poll
export const createPoll = async (req, res, next) => {
  try {
    const { question, options, groupId, expiresAt, tags } = req.body
    const userId = req.user.id

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({ message: "Poll must have at least 2 options" })
    }

    // Validate group if provided
    if (groupId) {
      const group = await Group.findById(groupId)
      if (!group) {
        return res.status(404).json({ message: "Group not found" })
      }

      // Check if user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "You must be a member of this group to create a poll" })
      }
    }

    // Format options
    const formattedOptions = options.map((option) => ({
      text: option,
      votes: [],
    }))

    const newPoll = new Poll({
      creator: userId,
      question,
      options: formattedOptions,
      group: groupId || null,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
      tags: tags || [],
    })

    await newPoll.save()

    // Award points to user for creating a poll
    await User.findByIdAndUpdate(userId, { $inc: { points: 10 } })

    // Populate creator information
    const populatedPoll = await Poll.findById(newPoll._id)
      .populate("creator", "username profilePicture")
      .populate("group", "name logo")

    res.status(201).json({
      message: "Poll created successfully",
      poll: populatedPoll,
    })
  } catch (error) {
    next(error)
  }
}

// Get active polls
export const getActivePolls = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Get user's favorite teams if authenticated
    let favoriteTeams = []
    if (req.user) {
      const user = await User.findById(req.user.id)
      favoriteTeams = user.favoriteTeams || []
    }

    // Get active polls from favorite teams and general polls
    const polls = await Poll.find({
      expiresAt: { $gt: new Date() },
      isLive: true,
      $or: [{ group: { $in: favoriteTeams } }, { group: null }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "username profilePicture")
      .populate("group", "name logo")

    const totalPolls = await Poll.countDocuments({
      expiresAt: { $gt: new Date() },
      isLive: true,
      $or: [{ group: { $in: favoriteTeams } }, { group: null }],
    })

    res.status(200).json({
      polls,
      pagination: {
        total: totalPolls,
        page,
        pages: Math.ceil(totalPolls / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get polls for a specific group
export const getGroupPolls = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const showExpired = req.query.showExpired === "true"

    // Check if group exists
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // If group is private, check if user is a member
    if (group.isPrivate && req.user) {
      const userId = req.user.id
      if (!group.members.includes(userId)) {
        return res.status(403).json({ message: "You must be a member to view polls in this group" })
      }
    }

    // Build query
    const query = { group: groupId }
    if (!showExpired) {
      query.expiresAt = { $gt: new Date() }
      query.isLive = true
    }

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "username profilePicture")

    const totalPolls = await Poll.countDocuments(query)

    res.status(200).json({
      polls,
      pagination: {
        total: totalPolls,
        page,
        pages: Math.ceil(totalPolls / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get a single poll
export const getPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params

    const poll = await Poll.findById(pollId)
      .populate("creator", "username profilePicture")
      .populate("group", "name logo")

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    // If poll is in a private group, check if user is a member
    if (poll.group) {
      const group = await Group.findById(poll.group)
      if (group && group.isPrivate && req.user) {
        const userId = req.user.id
        if (!group.members.includes(userId)) {
          return res.status(403).json({ message: "You must be a member to view this poll" })
        }
      }
    }

    res.status(200).json({ poll })
  } catch (error) {
    next(error)
  }
}

// Vote on a poll
export const voteOnPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params
    const { optionIndex } = req.body
    const userId = req.user.id

    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    // Check if poll is still active
    if (poll.expiresAt < new Date() || !poll.isLive) {
      return res.status(400).json({ message: "This poll has expired or is no longer active" })
    }

    // Check if option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" })
    }

    // Check if user has already voted
    const hasVoted = poll.options.some((option) => option.votes.some((vote) => vote.toString() === userId))

    if (hasVoted) {
      // Remove previous vote
      poll.options.forEach((option) => {
        option.votes = option.votes.filter((vote) => vote.toString() !== userId)
      })
      poll.totalVotes -= 1
    }

    // Add new vote
    poll.options[optionIndex].votes.push(userId)
    poll.totalVotes = (poll.totalVotes || 0) + 1

    await poll.save()

    // Award points to user for voting
    if (!hasVoted) {
      await User.findByIdAndUpdate(userId, { $inc: { points: 1 } })
    }

    res.status(200).json({
      message: "Vote recorded successfully",
      poll,
    })
  } catch (error) {
    next(error)
  }
}

// End a poll early
export const endPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params
    const userId = req.user.id

    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    // Check if user is the creator or an admin
    if (poll.creator.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to end this poll" })
    }

    // End the poll
    poll.isLive = false
    await poll.save()

    res.status(200).json({
      message: "Poll ended successfully",
      poll,
    })
  } catch (error) {
    next(error)
  }
}

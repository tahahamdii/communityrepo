import Group from "../models/Group.js"
import User from "../models/User.js"
import Post from "../models/Post.js"

// Create a new group
export const createGroup = async (req, res, next) => {
  try {
    const { name, description, category, logo, coverImage, isPrivate, rules, tags } = req.body
    const userId = req.user.id

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name })
    if (existingGroup) {
      return res.status(400).json({ message: "A group with this name already exists" })
    }

    const newGroup = new Group({
      name,
      description,
      category,
      logo: logo || "",
      coverImage: coverImage || "",
      admins: [userId],
      moderators: [userId],
      members: [userId],
      isPrivate: isPrivate || false,
      rules: rules || [],
      tags: tags || [],
    })

    await newGroup.save()

    // Award points to user for creating a group
    await User.findByIdAndUpdate(userId, { $inc: { points: 20 } })

    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    })
  } catch (error) {
    next(error)
  }
}

// Get all public groups
export const getPublicGroups = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const category = req.query.category

    const filter = { isPrivate: false }
    if (category) {
      filter.category = category
    }

    const groups = await Group.find(filter)
      .sort({ members: -1 })
      .skip(skip)
      .limit(limit)
      .select("name description category logo coverImage members")

    const totalGroups = await Group.countDocuments(filter)

    res.status(200).json({
      groups,
      pagination: {
        total: totalGroups,
        page,
        pages: Math.ceil(totalGroups / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get group details
export const getGroupDetails = async (req, res, next) => {
  try {
    const { groupId } = req.params

    const group = await Group.findById(groupId)
      .populate("admins", "username profilePicture")
      .populate("moderators", "username profilePicture")

    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // If group is private, check if user is a member
    if (group.isPrivate) {
      const userId = req.user.id
      if (!group.members.includes(userId)) {
        return res.status(403).json({
          message: "This is a private group",
          isPrivate: true,
          name: group.name,
          description: group.description,
          category: group.category,
          logo: group.logo,
          membersCount: group.members.length,
        })
      }
    }

    // Get member count
    const membersCount = group.members.length

    // Get post count
    const postsCount = await Post.countDocuments({ group: groupId })

    res.status(200).json({
      group: {
        ...group._doc,
        membersCount,
        postsCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Join a group
export const joinGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this group" })
    }

    // Add user to members
    group.members.push(userId)
    await group.save()

    // Award points to user for joining a group
    await User.findByIdAndUpdate(userId, { $inc: { points: 2 } })

    res.status(200).json({
      message: "Successfully joined the group",
      group: {
        _id: group._id,
        name: group.name,
        logo: group.logo,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Leave a group
export const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this group" })
    }

    // Check if user is the only admin
    if (group.admins.length === 1 && group.admins[0].toString() === userId) {
      return res.status(400).json({
        message: "You cannot leave the group as you are the only admin. Transfer admin rights first.",
      })
    }

    // Remove user from members, admins, and moderators
    group.members = group.members.filter((id) => id.toString() !== userId)
    group.admins = group.admins.filter((id) => id.toString() !== userId)
    group.moderators = group.moderators.filter((id) => id.toString() !== userId)

    await group.save()

    res.status(200).json({
      message: "Successfully left the group",
    })
  } catch (error) {
    next(error)
  }
}

// Update group details
export const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id
    const { description, logo, coverImage, isPrivate, rules, tags } = req.body

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is an admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "Only group admins can update group details" })
    }

    // Update fields
    const updateData = {}
    if (description !== undefined) updateData.description = description
    if (logo !== undefined) updateData.logo = logo
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate
    if (rules !== undefined) updateData.rules = rules
    if (tags !== undefined) updateData.tags = tags

    const updatedGroup = await Group.findByIdAndUpdate(groupId, { $set: updateData }, { new: true })

    res.status(200).json({
      message: "Group updated successfully",
      group: updatedGroup,
    })
  } catch (error) {
    next(error)
  }
}

// Add moderator to group
export const addModerator = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { userId: moderatorId } = req.body
    const adminId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is an admin
    if (!group.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only group admins can add moderators" })
    }

    // Check if user to be added exists and is a member
    const user = await User.findById(moderatorId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!group.members.includes(moderatorId)) {
      return res.status(400).json({ message: "User must be a member of the group to be a moderator" })
    }

    // Add user to moderators if not already a moderator
    if (!group.moderators.includes(moderatorId)) {
      group.moderators.push(moderatorId)
      await group.save()
    }

    res.status(200).json({
      message: "Moderator added successfully",
      moderator: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Remove moderator from group
export const removeModerator = async (req, res, next) => {
  try {
    const { groupId, userId: moderatorId } = req.params
    const adminId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is an admin
    if (!group.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only group admins can remove moderators" })
    }

    // Remove user from moderators
    group.moderators = group.moderators.filter((id) => id.toString() !== moderatorId)
    await group.save()

    res.status(200).json({
      message: "Moderator removed successfully",
    })
  } catch (error) {
    next(error)
  }
}

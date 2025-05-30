import User from "../models/User.js"
import Group from "../models/Group.js"
import Post from "../models/Post.js"

// Search across all entities
export const search = async (req, res, next) => {
  try {
    const { query, type } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const results = {}
    let total = 0

    // Search users
    if (!type || type === "users") {
      const users = await User.find({
        $or: [{ username: { $regex: query, $options: "i" } }, { bio: { $regex: query, $options: "i" } }],
      })
        .select("username profilePicture bio")
        .skip(type ? skip : 0)
        .limit(type ? limit : 5)

      const totalUsers = await User.countDocuments({
        $or: [{ username: { $regex: query, $options: "i" } }, { bio: { $regex: query, $options: "i" } }],
      })

      results.users = users
      if (type === "users") {
        total = totalUsers
      }
    }

    // Search groups
    if (!type || type === "groups") {
      // Only search public groups or groups the user is a member of
      const groupQuery = {
        $and: [
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { tags: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }

      if (req.user) {
        groupQuery.$and.push({
          $or: [{ isPrivate: false }, { members: req.user.id }],
        })
      } else {
        groupQuery.$and.push({ isPrivate: false })
      }

      const groups = await Group.find(groupQuery)
        .select("name description logo category")
        .skip(type ? skip : 0)
        .limit(type ? limit : 5)

      const totalGroups = await Group.countDocuments(groupQuery)

      results.groups = groups
      if (type === "groups") {
        total = totalGroups
      }
    }

    // Search posts
    if (!type || type === "posts") {
      // Only search public posts or posts in groups the user is a member of
      let postQuery = {
        $text: { $search: query },
      }

      if (req.user) {
        const user = await User.findById(req.user.id)
        const userGroups = user ? user.favoriteTeams : []

        postQuery = {
          $and: [
            { $text: { $search: query } },
            {
              $or: [{ group: null }, { group: { $in: userGroups } }],
            },
          ],
        }
      } else {
        postQuery = {
          $and: [{ $text: { $search: query } }, { group: null }],
        }
      }

      const posts = await Post.find(postQuery)
        .sort({ score: { $meta: "textScore" } })
        .skip(type ? skip : 0)
        .limit(type ? limit : 5)
        .populate("author", "username profilePicture")
        .populate("group", "name logo")

      const totalPosts = await Post.countDocuments(postQuery)

      results.posts = posts
      if (type === "posts") {
        total = totalPosts
      }
    }

    res.status(200).json({
      results,
      pagination: type
        ? {
            total,
            page,
            pages: Math.ceil(total / limit),
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
}

// Search users
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const users = await User.find({
      $or: [{ username: { $regex: query, $options: "i" } }, { bio: { $regex: query, $options: "i" } }],
    })
      .select("username profilePicture bio")
      .skip(skip)
      .limit(limit)

    const totalUsers = await User.countDocuments({
      $or: [{ username: { $regex: query, $options: "i" } }, { bio: { $regex: query, $options: "i" } }],
    })

    res.status(200).json({
      users,
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

// Search groups
export const searchGroups = async (req, res, next) => {
  try {
    const { query, category } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    // Build query
    const groupQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }

    // Add category filter if provided
    if (category) {
      groupQuery.$and.push({ category })
    }

    // Only show public groups or groups the user is a member of
    if (req.user) {
      groupQuery.$and.push({
        $or: [{ isPrivate: false }, { members: req.user.id }],
      })
    } else {
      groupQuery.$and.push({ isPrivate: false })
    }

    const groups = await Group.find(groupQuery).select("name description logo category").skip(skip).limit(limit)

    const totalGroups = await Group.countDocuments(groupQuery)

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

// Search posts
export const searchPosts = async (req, res, next) => {
  try {
    const { query, groupId } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    // Build query
    let postQuery = {
      $text: { $search: query },
    }

    // Add group filter if provided
    if (groupId) {
      postQuery.group = groupId

      // Check if group is private
      const group = await Group.findById(groupId)
      if (group && group.isPrivate && req.user) {
        const userId = req.user.id
        if (!group.members.includes(userId)) {
          return res.status(403).json({ message: "You must be a member to search posts in this group" })
        }
      }
    } else {
      // Only search public posts or posts in groups the user is a member of
      if (req.user) {
        const user = await User.findById(req.user.id)
        const userGroups = user ? user.favoriteTeams : []

        postQuery = {
          $and: [
            { $text: { $search: query } },
            {
              $or: [{ group: null }, { group: { $in: userGroups } }],
            },
          ],
        }
      } else {
        postQuery = {
          $and: [{ $text: { $search: query } }, { group: null }],
        }
      }
    }

    const posts = await Post.find(postQuery)
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profilePicture")
      .populate("group", "name logo")

    const totalPosts = await Post.countDocuments(postQuery)

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

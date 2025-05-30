import ChatMessage from "../models/ChatMessage.js"
import Group from "../models/Group.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        return next(new Error("Authentication error"))
      }

      socket.userId = user._id.toString()
      socket.username = user.username
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User ${socket.username} connected`)

    // Join group chat room
    socket.on("join-group", async (groupId) => {
      try {
        const group = await Group.findById(groupId)
        if (!group) {
          socket.emit("error", { message: "Group not found" })
          return
        }

        // Check if user is a member
        if (!group.members.includes(socket.userId)) {
          socket.emit("error", { message: "You must be a member to join this chat" })
          return
        }

        socket.join(groupId)
        socket.emit("joined-group", { groupId, groupName: group.name })

        // Send recent messages
        const recentMessages = await ChatMessage.find({ group: groupId })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate("sender", "username profilePicture")

        socket.emit("recent-messages", recentMessages.reverse())
      } catch (error) {
        socket.emit("error", { message: "Failed to join group" })
      }
    })

    // Leave group chat room
    socket.on("leave-group", (groupId) => {
      socket.leave(groupId)
      socket.emit("left-group", { groupId })
    })

    // Send message to group
    socket.on("send-message", async (data) => {
      try {
        const { groupId, content, event } = data

        if (!content || content.trim().length === 0) {
          socket.emit("error", { message: "Message content cannot be empty" })
          return
        }

        const group = await Group.findById(groupId)
        if (!group) {
          socket.emit("error", { message: "Group not found" })
          return
        }

        // Check if user is a member
        if (!group.members.includes(socket.userId)) {
          socket.emit("error", { message: "You must be a member to send messages" })
          return
        }

        // Create and save message
        const newMessage = new ChatMessage({
          sender: socket.userId,
          content: content.trim(),
          group: groupId,
          event: event || null,
        })

        await newMessage.save()

        // Populate sender information
        const populatedMessage = await ChatMessage.findById(newMessage._id).populate(
          "sender",
          "username profilePicture",
        )

        // Broadcast message to all users in the group
        io.to(groupId).emit("new-message", populatedMessage)

        // Award points to user for sending a message
        await User.findByIdAndUpdate(socket.userId, { $inc: { points: 1 } })
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { groupId, isTyping } = data
      socket.to(groupId).emit("user-typing", {
        userId: socket.userId,
        username: socket.username,
        isTyping,
      })
    })

    // Handle live poll updates
    socket.on("join-poll", (pollId) => {
      socket.join(`poll-${pollId}`)
    })

    socket.on("leave-poll", (pollId) => {
      socket.leave(`poll-${pollId}`)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.username} disconnected`)
    })
  })

  // Function to broadcast poll updates
  io.broadcastPollUpdate = (pollId, pollData) => {
    io.to(`poll-${pollId}`).emit("poll-updated", pollData)
  }

  return io
}

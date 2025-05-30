import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import groupRoutes from "./routes/groups.js"
import pollRoutes from "./routes/polls.js"
import rankingRoutes from "./routes/rankings.js"
import searchRoutes from "./routes/search.js"
import moderationRoutes from "./routes/moderation.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { setupSocketHandlers } from "./socket/socketHandlers.js"
import { errorHandler } from "./middleware/errorHandler.js"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/polls", pollRoutes)
app.use("/api/rankings", rankingRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/moderation", moderationRoutes)

// Socket.io setup
setupSocketHandlers(io)

// Error handling middleware
app.use(errorHandler)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app

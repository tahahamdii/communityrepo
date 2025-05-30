import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Authenticate token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    req.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      isModerator: user.isModerator,
    }

    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (user) {
        req.user = {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
          isModerator: user.isModerator,
        }
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Require admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" })
  }
  next()
}

// Require moderator middleware
export const requireModerator = (req, res, next) => {
  if (!req.user || (!req.user.isModerator && !req.user.isAdmin)) {
    return res.status(403).json({ message: "Moderator privileges required" })
  }
  next()
}

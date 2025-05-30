import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"

// Register a new user
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      })
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
    })

    await newUser.save()

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Return user data without password
    const { password: _, ...userData } = newUser._doc

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last active
    user.lastActive = Date.now()
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Return user data without password
    const { password: _, ...userData } = user._doc

    res.status(200).json({
      message: "Login successful",
      user: userData,
      token,
    })
  } catch (error) {
    next(error)
  }
}

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
}

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate new JWT token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(200).json({ token })
  } catch (error) {
    next(error)
  }
}

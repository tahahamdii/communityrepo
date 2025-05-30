import express from "express"
import { body } from "express-validator"
import { register, login, getCurrentUser, refreshToken } from "../controllers/authController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Validation rules
const registerValidation = [
  body("username").isLength({ min: 3, max: 30 }).trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
]

const loginValidation = [body("email").isEmail().normalizeEmail(), body("password").exists()]

// Routes
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)
router.get("/me", authenticateToken, getCurrentUser)
router.post("/refresh", authenticateToken, refreshToken)

export default router

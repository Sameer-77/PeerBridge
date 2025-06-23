import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Register
// routes/auth.js
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, skills, bio } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      })
    }

    // Check email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Process skills array
    let processedSkills = []
    if (skills) {
      processedSkills = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(s => s)
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'junior',
      skills: processedSkills,
      bio: bio || ''
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        points: user.points
      }
    })
  } catch (error) {
    console.error('Registration error:', error)

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      })
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

// Login
// routes/auth.js
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last seen and online status
    user.lastSeen = new Date()
    user.isOnline = true
    await user.save()

    // Remove password before sending user data
    const userWithoutPassword = user.toObject()
    delete userWithoutPassword.password

    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.isOnline = false
    user.lastSeen = new Date()
    await user.save()

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Server error during logout' })
  }
})

export default router